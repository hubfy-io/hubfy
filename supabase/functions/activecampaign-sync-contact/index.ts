/**
 * activecampaign-sync-contact
 *
 * Creates or updates a contact in Active Campaign and applies tags.
 * Called internally (service role) after a purchase is confirmed.
 *
 * POST { tenant_id, email, name?, tags?: string[] }
 * Auth: service role (internal call) OR tenant editor
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const tenantId = typeof body?.tenant_id === "string" ? body.tenant_id.trim() : null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
    const name = typeof body?.name === "string" ? body.name.trim() : null;
    const tags: string[] = Array.isArray(body?.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [];

    if (!tenantId) return jsonResponse({ error: "tenant_id é obrigatório" }, 400);
    if (!email) return jsonResponse({ error: "email é obrigatório" }, 400);

    // Get integration + credentials
    const { data: integration } = await supabaseAdmin
      .from("tenant_integrations")
      .select("id, status")
      .eq("tenant_id", tenantId)
      .eq("provider", "activecampaign")
      .eq("status", "active")
      .maybeSingle();

    if (!integration) {
      return jsonResponse({ skipped: true, reason: "no_integration" });
    }

    const { data: secret } = await supabaseAdmin
      .from("tenant_integration_secrets")
      .select("credentials")
      .eq("integration_id", integration.id)
      .single();

    const creds = secret?.credentials as Record<string, string> | null;
    const apiUrl = creds?.api_url;
    const apiKey = creds?.api_key;

    if (!apiUrl || !apiKey) {
      return jsonResponse({ skipped: true, reason: "missing_credentials" });
    }

    const acHeaders = {
      "Api-Token": apiKey,
      "Content-Type": "application/json",
    };

    // ── 1. Create or update contact (sync) ──
    const syncPayload: Record<string, unknown> = { contact: { email } };
    if (name) {
      const parts = name.trim().split(/\s+/);
      syncPayload.contact = {
        ...syncPayload.contact as Record<string, unknown>,
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") || undefined,
      };
    }

    const syncRes = await fetch(`${apiUrl}/api/3/contact/sync`, {
      method: "POST",
      headers: acHeaders,
      body: JSON.stringify(syncPayload),
    });

    if (!syncRes.ok) {
      const errText = await syncRes.text();
      console.error("activecampaign-sync-contact: sync failed:", syncRes.status, errText);
      return jsonResponse({ error: `AC sync failed: ${syncRes.status}` }, 502);
    }

    const syncData = await syncRes.json();
    const contactId: string | number | null = syncData?.contact?.id ?? null;

    if (!contactId) {
      return jsonResponse({ error: "Contact ID not returned from AC" }, 500);
    }

    // ── 2. Apply tags (create tag if needed, then link to contact) ──
    const tagResults: string[] = [];

    for (const tagName of tags) {
      try {
        // Find or create tag
        const tagSearchRes = await fetch(
          `${apiUrl}/api/3/tags?search=${encodeURIComponent(tagName)}`,
          { headers: acHeaders },
        );

        let tagId: string | number | null = null;

        if (tagSearchRes.ok) {
          const tagSearchData = await tagSearchRes.json();
          const existing = (tagSearchData.tags ?? []).find(
            (t: Record<string, unknown>) => t.tag === tagName,
          );
          tagId = existing?.id ?? null;
        }

        if (!tagId) {
          // Create tag
          const createTagRes = await fetch(`${apiUrl}/api/3/tags`, {
            method: "POST",
            headers: acHeaders,
            body: JSON.stringify({ tag: { tag: tagName, tagType: "contact" } }),
          });
          if (createTagRes.ok) {
            const createTagData = await createTagRes.json();
            tagId = createTagData?.tag?.id ?? null;
          }
        }

        if (tagId) {
          // Link tag to contact
          await fetch(`${apiUrl}/api/3/contactTags`, {
            method: "POST",
            headers: acHeaders,
            body: JSON.stringify({ contactTag: { contact: String(contactId), tag: String(tagId) } }),
          });
          tagResults.push(tagName);
        }
      } catch (tagErr) {
        console.warn("activecampaign-sync-contact: tag error for", tagName, tagErr);
      }
    }

    return jsonResponse({
      success: true,
      contact_id: contactId,
      tags_applied: tagResults,
    });
  } catch (error) {
    console.error("activecampaign-sync-contact error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erro interno" },
      500,
    );
  }
});
