import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=denonext";
import {
  authenticateRequest,
  authorizeWorkspace,
  toErrorResponse,
} from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed", code: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Auth (JWT-only, owner)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const identity = await authenticateRequest(req, supabaseAdmin);

    let tenantId: string | null = null;
    try {
      const body = await req.json();
      tenantId = body?.tenant_id ?? null;
    } catch {
      tenantId = null;
    }

    if (!tenantId) {
      return new Response(JSON.stringify({ error: "tenant_id is required", code: "missing_required_field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Authorize workspace (owner-only, JWT-only)
    const auth = await authorizeWorkspace(identity, tenantId, supabaseAdmin, {
      minRole: "owner",
      jwtOnly: true,
    });

    // 3. Get subscription with stripe_customer_id
    const { data: sub, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (subError || !sub?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found", code: "stripe_not_configured" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Create Customer Portal session
    const stripe = new Stripe(stripeSecretKey);

    const origin = req.headers.get("Origin") || req.headers.get("Referer") || "http://localhost:8080";
    const baseUrl = origin.replace(/\/$/, "");

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${baseUrl}/admin/settings?tab=payments`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stripe-portal error:", error);
    return toErrorResponse(error, corsHeaders);
  }
});
