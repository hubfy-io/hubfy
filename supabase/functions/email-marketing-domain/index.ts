import { createClient } from "jsr:@supabase/supabase-js@2";
import { authenticateRequest, authorizeWorkspace, toErrorResponse } from "../_shared/auth.ts";

/* ─── Email Marketing: Domain Management ─── */
// Gerencia domínios de envio via Resend Domains API.
// Recebe tenant_id explícito no body, valida ownership.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_MKT_API_KEY");

    if (!resendApiKey) {
      return jsonResponse(
        { error: "Resend API key not configured", code: "missing_resend_mkt_api_key" },
        500,
      );
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const identity = await authenticateRequest(req, admin);
    const { action, tenant_id: requestedTenantId, domain } = await req.json();

    if (!requestedTenantId) {
      return jsonResponse({ error: "tenant_id is required" }, 400);
    }

    const authResult = await authorizeWorkspace(identity, requestedTenantId, admin, { minRole: "editor" });
    const tenantId = authResult.tenantId;

    switch (action) {
      case "create": {
        if (!domain) {
          return jsonResponse({ error: "Domain is required" }, 400);
        }

        // ─── Check if domain already exists in Resend ───
        const listRes = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendApiKey}` },
        });

        let existingDomain: { id: string; name: string; status: string; records: unknown[] } | null = null;

        if (listRes.ok) {
          const listData = await listRes.json();
          const domains = listData.data ?? listData ?? [];
          existingDomain = domains.find(
            (d: { name: string }) => d.name.toLowerCase() === domain.toLowerCase(),
          ) ?? null;
        }

        let resendData: { id: string; records: unknown[]; status?: string };

        if (existingDomain) {
          // Domain already exists in same Resend account — adopt it
          resendData = existingDomain;
        } else {
          // Create new domain
          const resendRes = await fetch("https://api.resend.com/domains", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: domain, region: "sa-east-1" }),
          });

          resendData = await resendRes.json();

          if (!resendRes.ok) {
            const errBody = resendData as Record<string, unknown>;
            return jsonResponse(
              {
                error: (errBody.message as string) ?? "Failed to create domain",
                code: "resend_error",
                provider: "resend",
                provider_status: resendRes.status,
                provider_message: (errBody.message as string) ?? null,
                provider_error_type: (errBody.name as string) ?? null,
              },
              resendRes.status,
            );
          }
        }

        const { error: upsertError } = await admin
          .from("tenant_email_settings")
          .upsert(
            {
              tenant_id: tenantId,
              resend_domain_id: resendData.id,
              domain,
              domain_status: existingDomain?.status === "verified" ? "verified" : "pending",
              dns_records: resendData.records ?? [],
              enabled: existingDomain?.status === "verified",
            },
            { onConflict: "tenant_id" },
          );

        if (upsertError) {
          return jsonResponse({ error: upsertError.message }, 500);
        }

        return jsonResponse({
          success: true,
          domain_id: resendData.id,
          records: resendData.records,
          status: existingDomain?.status === "verified" ? "verified" : "pending",
          adopted: !!existingDomain,
        });
      }

      case "verify": {
        const { data: settings } = await admin
          .from("tenant_email_settings")
          .select("resend_domain_id")
          .eq("tenant_id", tenantId)
          .single();

        if (!settings?.resend_domain_id) {
          return jsonResponse({ error: "No domain configured" }, 400);
        }

        await fetch(
          `https://api.resend.com/domains/${settings.resend_domain_id}/verify`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${resendApiKey}` },
          },
        );

        const statusRes = await fetch(
          `https://api.resend.com/domains/${settings.resend_domain_id}`,
          { headers: { Authorization: `Bearer ${resendApiKey}` } },
        );
        const statusData = await statusRes.json();

        const verified = statusData.status === "verified";
        const newStatus = verified ? "verified" : "pending";

        await admin
          .from("tenant_email_settings")
          .update({
            domain_status: newStatus,
            enabled: verified,
            dns_records: statusData.records ?? [],
          })
          .eq("tenant_id", tenantId);

        return jsonResponse({
          success: true,
          status: newStatus,
          records: statusData.records,
        });
      }

      case "delete": {
        const { data: settings } = await admin
          .from("tenant_email_settings")
          .select("resend_domain_id")
          .eq("tenant_id", tenantId)
          .single();

        if (settings?.resend_domain_id) {
          await fetch(
            `https://api.resend.com/domains/${settings.resend_domain_id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${resendApiKey}` },
            },
          );
        }

        await admin
          .from("tenant_email_settings")
          .update({
            resend_domain_id: null,
            domain: null,
            domain_status: "not_configured",
            dns_records: [],
            enabled: false,
          })
          .eq("tenant_id", tenantId);

        return jsonResponse({ success: true });
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error: unknown) {
    console.error("email-marketing-domain error:", error);
    return toErrorResponse(error, corsHeaders);
  }
});
