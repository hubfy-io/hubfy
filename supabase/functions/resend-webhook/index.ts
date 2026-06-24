import { createClient } from "jsr:@supabase/supabase-js@2";

/* ─── Resend Webhook Handler ─── */
// Recebe eventos de status da Resend e atualiza email_logs.
// Endpoint público (verify_jwt = false) — Resend precisa acessar.

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const body = await req.json();

    // Resend envia { type: "email.delivered", created_at: "...", data: { email_id: "...", ... } }
    const eventType: string = body?.type;
    const emailId: string = body?.data?.email_id;

    if (!eventType || !emailId) {
      // Evento sem dados — ignorar silenciosamente
      return new Response("OK", { status: 200 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar o log pelo resend_message_id
    const { data: emailLog } = await admin
      .from("email_logs")
      .select("id")
      .eq("resend_message_id", emailId)
      .maybeSingle();

    if (!emailLog) {
      // Não encontrado — pode ser email enviado antes do sistema de logs
      return new Response("OK", { status: 200 });
    }

    // Montar update baseado no tipo de evento
    const update: Record<string, unknown> = {};
    const now = new Date().toISOString();

    switch (eventType) {
      case "email.delivered":
        update.status = "delivered";
        update.delivered_at = now;
        break;

      case "email.opened":
        update.status = "opened";
        // Só registrar primeira abertura
        update.opened_at = now;
        break;

      case "email.clicked":
        update.status = "clicked";
        update.clicked_at = now;
        break;

      case "email.bounced":
        update.status = "bounced";
        update.bounced_at = now;
        break;

      case "email.complained":
        update.status = "complained";
        update.complained_at = now;
        break;

      case "email.delivery_delayed":
        // Não muda status, apenas loga
        console.warn("resend-webhook: delivery delayed for", emailId);
        return new Response("OK", { status: 200 });

      default:
        // Evento desconhecido — ignorar
        return new Response("OK", { status: 200 });
    }

    // Atualizar — usar condições para não regredir status
    // Ex: se já foi "clicked", não voltar para "opened"
    const statusPriority: Record<string, number> = {
      sent: 0,
      delivered: 1,
      opened: 2,
      clicked: 3,
      bounced: 10,
      complained: 10,
      failed: 10,
    };

    const { data: current } = await admin
      .from("email_logs")
      .select("status, opened_at, clicked_at")
      .eq("id", emailLog.id)
      .single();

    if (current) {
      const currentPriority = statusPriority[current.status] ?? 0;
      const newPriority = statusPriority[update.status as string] ?? 0;

      // Não regredir status (exceto bounce/complaint que sempre atualizam)
      if (newPriority <= currentPriority && newPriority < 10) {
        // Ainda atualizar timestamps se forem novos
        if (update.opened_at && current.opened_at) delete update.opened_at;
        if (update.clicked_at && current.clicked_at) delete update.clicked_at;
        delete update.status;
      }

      // Se já tinha opened_at, não sobrescrever
      if (update.opened_at && current.opened_at) delete update.opened_at;
      if (update.clicked_at && current.clicked_at) delete update.clicked_at;
    }

    if (Object.keys(update).length > 0) {
      const { error } = await admin
        .from("email_logs")
        .update(update)
        .eq("id", emailLog.id);

      if (error) {
        console.error("resend-webhook: update error:", error);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("resend-webhook error:", error);
    // Sempre retornar 200 para Resend não reenviar infinitamente
    return new Response("OK", { status: 200 });
  }
});
