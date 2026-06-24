/**
 * activecampaign-connect
 *
 * Validates an Active Campaign API URL + API Key, creates/updates the tenant
 * integration, and stores credentials securely.
 *
 * POST { tenant_id, api_url, api_key }
 * Auth: tenant editor
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest, authorizeWorkspace, toErrorResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function maskKey(key: string): string {
  return key.length > 4 ? "••••" + key.slice(-4) : "••••";
}

function normalizeApiUrl(url: string): string {
  // Strip trailing slash and ensure it ends cleanly
  return url.replace(/\/+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed", code: "method_not_allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Auth
    const identity = await authenticateRequest(req, supabaseAdmin);

    // Parse body
    const body = await req.json();
    const tenantId =
      typeof body?.tenant_id === "string" ? body.tenant_id.trim() : null;
    const rawApiUrl =
      typeof body?.api_url === "string" ? body.api_url.trim() : null;
    const apiKey =
      typeof body?.api_key === "string" ? body.api_key.trim() : null;

    if (!tenantId) return jsonResponse({ error: "tenant_id is required", code: "missing_required_field" }, 400);
    if (!rawApiUrl) return jsonResponse({ error: "api_url is required", code: "missing_required_field" }, 400);
    if (!apiKey) return jsonResponse({ error: "api_key is required", code: "missing_required_field" }, 400);

    const apiUrl = normalizeApiUrl(rawApiUrl);

    // Validate user is editor of this tenant
    const auth = await authorizeWorkspace(identity, tenantId, supabaseAdmin, { minRole: "editor" });

    // Validate credentials with Active Campaign API
    const testRes = await fetch(`${apiUrl}/api/3/contacts?limit=1`, {
      headers: {
        "Api-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (testRes.status === 401 || testRes.status === 403) {
      return jsonResponse({ error: "Invalid API key or insufficient permissions", code: "invalid_credentials" }, 400);
    }
    if (!testRes.ok) {
      // 404 often means the URL is wrong
      if (testRes.status === 404) {
        return jsonResponse({ error: "Incorrect API URL. Check your account address.", code: "invalid_credentials" }, 400);
      }
      return jsonResponse({ error: `ActiveCampaign API error: ${testRes.status}`, code: "connect_failed" }, 400);
    }

    // Extract account info if available
    const testData = await testRes.json().catch(() => null);
    const contactCount = testData?.meta?.total ?? null;

    // Build masked hints
    const urlHint = apiUrl.replace(/^https?:\/\//, "").split(".")[0] + ".api-ac...";
    const keyHint = maskKey(apiKey);

    // Atomic upsert: integration + secret in one transaction
    const { data: integration, error: connectError } = await supabaseAdmin
      .rpc("connect_integration", {
        p_tenant_id: tenantId,
        p_provider: "activecampaign",
        p_metadata: {
          account_name: "ActiveCampaign",
          account_url: apiUrl,
        },
        p_credentials: { api_url: apiUrl, api_key: apiKey },
        p_credentials_hint: { api_url: urlHint, api_key: keyHint },
      })
      .single();

    if (connectError || !integration) {
      console.error("activecampaign-connect: error:", connectError);
      return jsonResponse({ error: "Failed to save integration", code: "integration_save_failed" }, 500);
    }

    return jsonResponse({ integration, contact_count: contactCount });
  } catch (error) {
    console.error("activecampaign-connect error:", error);
    return toErrorResponse(error, corsHeaders);
  }
});
