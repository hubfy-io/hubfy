import { createClient } from "jsr:@supabase/supabase-js@2";
import { authenticateRequest, authorizeWorkspace, toErrorResponse } from "../_shared/auth.ts";

/* ─── Email Marketing: Send Broadcast ─── */
// Orquestra envio via Resend Broadcasts API nativo.
// Fluxo: create ephemeral segment → sync contacts → send broadcast → cleanup.
// v1: envia para todos os customers subscribed (sem filtros avançados).

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

const SYNC_BATCH_SIZE = 50;
const SYNC_DELAY_MS = 600; // ~1.6 req/s (safe under 2 req/s limit)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let ephemeralSegmentId: string | null = null;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_MKT_API_KEY")!;

  try {
    // ── 1. Admin client ──
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // ── 2. Authenticate (who are you?) ──
    const identity = await authenticateRequest(req, admin);

    // ── 3. Parse body ──
    const { broadcast_id } = await req.json();

    if (!broadcast_id) {
      return jsonResponse({ error: "broadcast_id is required" }, 400);
    }

    // ── 4. Load resource to discover tenant_id ──
    const { data: broadcast } = await admin
      .from("email_broadcasts")
      .select("*")
      .eq("id", broadcast_id)
      .single();

    if (!broadcast) {
      return jsonResponse({ error: "Broadcast not found" }, 404);
    }

    // ── 5. Authorize workspace ──
    const auth = await authorizeWorkspace(identity, broadcast.tenant_id, admin, { minRole: "editor" });

    // ── 6. Idempotência ──
    if (broadcast.status !== "draft") {
      return jsonResponse({ error: `Broadcast already ${broadcast.status}` }, 409);
    }

    // ── 7. Settings + validações ──
    const { data: settings } = await admin
      .from("tenant_email_settings")
      .select("*")
      .eq("tenant_id", broadcast.tenant_id)
      .single();

    if (!settings?.enabled) {
      return jsonResponse({ error: "Email marketing is not enabled" }, 400);
    }
    if (settings.suspended) {
      return jsonResponse({ error: `Suspended: ${settings.suspended_reason}` }, 400);
    }
    if (settings.domain_status !== "verified") {
      return jsonResponse({ error: "Domain not verified" }, 400);
    }
    if (settings.domain && broadcast.from_email) {
      const emailDomain = broadcast.from_email.split("@")[1];
      if (emailDomain !== settings.domain) {
        return jsonResponse({ error: `from_email must use domain ${settings.domain}` }, 400);
      }
    }

    // ── 8. Ensure topic exists for tenant ──
    const topicId = await ensureResendTopic(admin, resendApiKey, settings, broadcast.tenant_id);

    // ── 9. Query customers (v1: todos inscritos) ──
    const { data: customers } = await admin
      .from("customers")
      .select("id, email, name")
      .eq("tenant_id", broadcast.tenant_id)
      .eq("email_marketing_status", "subscribed");

    if (!customers || customers.length === 0) {
      return jsonResponse({ error: "No subscribed customers found" }, 400);
    }

    if (customers.length > settings.max_recipients_per_broadcast) {
      return jsonResponse({
        error: `Limite: ${settings.max_recipients_per_broadcast} destinatários. Você tem ${customers.length}.`,
      }, 400);
    }

    // ── 10. Lock broadcast as sending ──
    const { data: lockResult } = await admin
      .from("email_broadcasts")
      .update({ status: "sending", recipient_count: customers.length })
      .eq("id", broadcast_id)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();

    if (!lockResult) {
      return jsonResponse({ error: "Broadcast already being sent" }, 409);
    }

    // ── 11. Create ephemeral segment for this broadcast ──
    // Segment efêmero garante que a audiência é exatamente os contatos atuais,
    // sem acúmulo de contatos antigos de broadcasts anteriores.
    const segmentRes = await resendFetch(resendApiKey, "POST", "/segments", {
      name: `hubfy-broadcast-${broadcast_id}`,
    });

    if (segmentRes.error || !segmentRes.id) {
      await admin.from("email_broadcasts")
        .update({ status: "failed", error_message: "Failed to create segment" })
        .eq("id", broadcast_id);
      return jsonResponse({ error: "Failed to create segment in Resend" }, 500);
    }

    ephemeralSegmentId = segmentRes.id as string;

    // ── 12. Sync contacts to Resend ──
    // Upsert por email. NÃO passamos topics — respeitamos opt-out existente.
    // Só adicionamos ao segment efêmero.
    let syncErrors = 0;

    for (let i = 0; i < customers.length; i += SYNC_BATCH_SIZE) {
      const batch = customers.slice(i, i + SYNC_BATCH_SIZE);

      for (const customer of batch) {
        const name = customer.name ?? "";
        const nameParts = name.split(" ");

        const contactRes = await resendFetch(resendApiKey, "POST", "/contacts", {
          email: customer.email,
          first_name: nameParts[0] || undefined,
          last_name: nameParts.slice(1).join(" ") || undefined,
          segments: [{ id: ephemeralSegmentId }],
        });

        if (contactRes.error) {
          syncErrors++;
          console.warn(`email-marketing-send: sync failed for ${customer.email}:`, contactRes.error);
        }
      }

      if (i + SYNC_BATCH_SIZE < customers.length) {
        await sleep(SYNC_DELAY_MS);
      }
    }

    // Abort if too many sync errors (>20% failed)
    const syncedCount = customers.length - syncErrors;
    if (syncedCount === 0 || syncErrors / customers.length > 0.2) {
      await admin.from("email_broadcasts")
        .update({ status: "failed", error_message: `Sync failed: ${syncErrors}/${customers.length} contacts` })
        .eq("id", broadcast_id);
      await cleanupSegment(resendApiKey, ephemeralSegmentId);
      return jsonResponse({ error: `Contact sync failed: ${syncErrors} errors` }, 500);
    }

    // ── 13. Create + send broadcast in Resend ──
    let html = broadcast.html;
    if (!html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}")) {
      html += `
        <table role="presentation" width="100%" style="margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
          <tr><td style="text-align:center;">
            <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="font-size:12px;color:#999;text-decoration:underline;">
              Cancelar inscrição
            </a>
          </td></tr>
        </table>`;
    }

    const broadcastRes = await resendFetch(resendApiKey, "POST", "/broadcasts", {
      segment_id: ephemeralSegmentId,
      from: `${broadcast.from_name} <${broadcast.from_email}>`,
      subject: broadcast.subject,
      reply_to: broadcast.reply_to ?? undefined,
      html,
      name: `hubfy-${broadcast_id}`,
      topic_id: topicId,
      send: true,
    });

    if (broadcastRes.error) {
      await admin.from("email_broadcasts")
        .update({ status: "failed", error_message: broadcastRes.error as string })
        .eq("id", broadcast_id);
      await cleanupSegment(resendApiKey, ephemeralSegmentId);
      return jsonResponse({ error: broadcastRes.error }, 500);
    }

    // ── 14. Finalize ──
    await admin.from("email_broadcasts")
      .update({
        status: "sent",
        resend_broadcast_id: broadcastRes.id as string,
        sent_at: new Date().toISOString(),
        recipient_count: syncedCount,
      })
      .eq("id", broadcast_id);

    // Cleanup: delete ephemeral segment (fire-and-forget)
    // O broadcast já foi enviado, não precisa mais do segment.
    cleanupSegment(resendApiKey, ephemeralSegmentId).catch(() => {});

    return jsonResponse({
      success: true,
      resend_broadcast_id: broadcastRes.id,
      recipient_count: syncedCount,
      sync_errors: syncErrors,
    });
  } catch (error: unknown) {
    console.error("email-marketing-send error:", error);
    // Cleanup segment on unexpected error
    if (ephemeralSegmentId) {
      cleanupSegment(resendApiKey, ephemeralSegmentId).catch(() => {});
    }
    return toErrorResponse(error, corsHeaders);
  }
});

/* ─── Resend API helper ─── */

async function resendFetch(
  apiKey: string,
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`Resend ${method} ${path} failed:`, data);
    return { error: data.message ?? `Resend error ${res.status}`, ...data };
  }

  return data;
}

/* ─── Cleanup ephemeral segment ─── */

async function cleanupSegment(apiKey: string, segmentId: string): Promise<void> {
  await resendFetch(apiKey, "DELETE", `/segments/${segmentId}`);
}

/* ─── Ensure Resend topic exists for tenant ─── */

async function ensureResendTopic(
  admin: ReturnType<typeof createClient>,
  apiKey: string,
  settings: Record<string, unknown>,
  tenantId: string,
): Promise<string> {
  if (settings.resend_topic_id) {
    return settings.resend_topic_id as string;
  }

  const { data: tenant } = await admin
    .from("tenants")
    .select("name")
    .eq("id", tenantId)
    .single();

  const topicName = tenant?.name
    ? `${tenant.name}`.slice(0, 50)
    : `Tenant ${tenantId.slice(0, 8)}`;

  const res = await resendFetch(apiKey, "POST", "/topics", {
    name: topicName,
    default_subscription: "opt_in",
    visibility: "private",
  });

  const topicId = res.id as string;

  await admin
    .from("tenant_email_settings")
    .update({ resend_topic_id: topicId })
    .eq("tenant_id", tenantId);

  return topicId;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
