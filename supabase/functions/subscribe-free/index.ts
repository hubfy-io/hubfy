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

    // Authorize workspace (owner-only, JWT-only)
    const auth = await authorizeWorkspace(identity, tenantId, supabaseAdmin, {
      minRole: "owner",
      jwtOnly: true,
    });

    const userId = auth.userId;

    // We need the user email for Stripe — fetch from auth.users via admin
    const { data: { user: authUser }, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authUserError || !authUser?.email) {
      throw new Error("Failed to fetch user email");
    }
    const userEmail = authUser.email;

    // 2. Get profile name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .maybeSingle();

    // 3. Stripe: busca customer existente por email, se não existe cria um novo
    const stripe = new Stripe(stripeSecretKey);

    const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
      console.log(`Stripe customer found: ${customerId}`);
    } else {
      const customer = await stripe.customers.create({
        name: profile?.name || userEmail,
        email: userEmail,
        metadata: { tenant_id: tenantId, user_id: userId },
      });
      customerId = customer.id;
      console.log(`Stripe customer created: ${customerId}`);
    }

    return new Response(
      JSON.stringify({ success: true, customer_id: customerId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("subscribe-free error:", error);
    return toErrorResponse(error, corsHeaders);
  }
});
