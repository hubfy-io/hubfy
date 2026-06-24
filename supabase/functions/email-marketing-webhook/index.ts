import { createClient } from "jsr:@supabase/supabase-js@2";

/* ─── Email Marketing: Webhook Handler ─── */
// Processa webhooks do Resend para:
// 1. email.bounced → marca customer como bounced
// 2. email.complained → marca customer como unsubscribed
// 3. contact.updated → sincroniza unsubscribe do Resend → Hubfy
//
// Métricas e performance tracking ficam no Resend nativo.

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  const rawBody = await req.text();

  // ── 1. Verificar assinatura Svix ──
  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (webhookSecret) {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing signature headers", { status: 401 });
    }

    const isValid = await verifySvixSignature(
      webhookSecret, svixId, svixTimestamp, rawBody, svixSignature,
    );

    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = body?.type as string;
  const data = body?.data as Record<string, unknown> | undefined;

  if (!eventType || !data) {
    return new Response("OK", { status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // ── contact.updated: sincronizar unsubscribe do Resend → Hubfy ──
    if (eventType === "contact.updated") {
      const email = data.email as string | undefined;
      const unsubscribed = data.unsubscribed as boolean | undefined;

      if (email && unsubscribed === true) {
        // Contato fez unsubscribe global no Resend → marcar em todos os tenants
        await admin
          .from("customers")
          .update({ email_marketing_status: "unsubscribed" })
          .eq("email", email);
      }

      return new Response("OK", { status: 200 });
    }

    // ── email.bounced / email.complained ──
    if (eventType !== "email.bounced" && eventType !== "email.complained") {
      return new Response("OK", { status: 200 });
    }

    // Identificar o tenant via broadcast local
    const resendBroadcastId = data.broadcast_id as string | undefined;
    if (!resendBroadcastId) {
      return new Response("OK", { status: 200 });
    }

    // Buscar broadcast local pelo resend_broadcast_id
    const { data: broadcast } = await admin
      .from("email_broadcasts")
      .select("tenant_id")
      .eq("resend_broadcast_id", resendBroadcastId)
      .maybeSingle();

    if (!broadcast) {
      return new Response("OK", { status: 200 });
    }

    const recipientEmail =
      Array.isArray(data.to) && data.to.length > 0 ? (data.to as string[])[0] : null;

    if (!recipientEmail) {
      return new Response("OK", { status: 200 });
    }

    // Atualizar customer status
    const newStatus = eventType === "email.bounced" ? "bounced" : "unsubscribed";
    const { error } = await admin
      .from("customers")
      .update({ email_marketing_status: newStatus })
      .eq("tenant_id", broadcast.tenant_id)
      .eq("email", recipientEmail);

    if (error) {
      console.error("email-marketing-webhook: update error:", error);
      return new Response("DB error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("email-marketing-webhook error:", error);
    return new Response("Internal error", { status: 500 });
  }
});

/* ─── Svix Signature Verification ─── */

async function verifySvixSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  body: string,
  signatureHeader: string,
): Promise<boolean> {
  try {
    const secretBytes = Uint8Array.from(
      atob(secret.startsWith("whsec_") ? secret.slice(6) : secret),
      (c) => c.charCodeAt(0),
    );

    const signedContent = `${svixId}.${svixTimestamp}.${body}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC", key, encoder.encode(signedContent),
    );

    const computedSignature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBytes)),
    );

    const signatures = signatureHeader.split(" ");
    return signatures.some((sig) => {
      const [, sigValue] = sig.split(",");
      return sigValue === computedSignature;
    });
  } catch (err) {
    console.error("Svix verification failed:", err);
    return false;
  }
}
