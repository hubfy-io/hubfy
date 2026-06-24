/**
 * Kirvano Adapter
 *
 * Docs: https://help.kirvano.com/hc/central-de-ajuda/articles/1765385505
 *
 * Payload real (confirmado):
 *   - Estrutura FLAT no raiz (sem wrapper "data")
 *   - Eventos em UPPERCASE: SALE_APPROVED, SALE_REFUSED, SALE_CHARGEBACK, SALE_REFUNDED
 *   - products é ARRAY (pode ter order bumps)
 *   - total_price é STRING formatada: "R$ 169,80"
 *   - customer: { name, document, email, phone_number }
 *   - payment: { method: "CREDIT_CARD" | "BANK_SLIP" | "PIX", brand, installments }
 *
 * Auth: token estático configurado no webhook.
 *   - Nome do header NÃO documentado oficialmente.
 *   - Testamos os headers mais prováveis.
 */

import type { NormalizedEvent, ProviderAdapter } from "../types.ts";

/* ─── Tipos do payload Kirvano (flat, confirmado pela doc) ── */

interface KirvanoPayload {
  event?: string;
  event_description?: string;
  checkout_id?: string;
  sale_id?: string;
  payment_method?: string;
  total_price?: string; // "R$ 169,80"
  type?: string; // "ONE_TIME" | "RECURRING"
  status?: string; // "APPROVED" | "PENDING" | "REFUSED" | "CANCELED" | "CHARGEBACK"
  created_at?: string;
  customer?: {
    name?: string;
    document?: string;
    email?: string;
    phone_number?: string;
  };
  payment?: {
    method?: string; // "CREDIT_CARD" | "BANK_SLIP" | "PIX"
    brand?: string;
    installments?: number;
    finished_at?: string;
  };
  products?: Array<{
    id?: string;
    name?: string;
    offer_id?: string;
    offer_name?: string;
    description?: string;
    price?: string; // "R$ 119,90"
    photo?: string;
    is_order_bump?: boolean;
  }>;
  plan?: {
    name?: string;
    charge_frequency?: string;
    next_charge_date?: string;
  };
  utm?: Record<string, string>;
  // Possível campo de token no body
  token?: string;
}

/* ─── Mapeamentos ──────────────────────────────────────────── */

const EVENT_MAP: Record<string, NormalizedEvent["eventType"]> = {
  SALE_APPROVED: "approved",
  SALE_REFUNDED: "refunded",
  SALE_CHARGEBACK: "chargeback",
  SALE_REFUSED: "cancelled", // recusada → tratamos como cancelamento
  BANK_SLIP_GENERATED: "pending",
  BANK_SLIP_EXPIRED: "cancelled",
  PIX_GENERATED: "pending",
  PIX_EXPIRED: "cancelled",
};

const PAYMENT_MAP: Record<string, string> = {
  CREDIT_CARD: "credit_card",
  BANK_SLIP: "billet",
  PIX: "pix",
};

/* ─── Helpers ─────────────────────────────────────────────── */

/**
 * Converte "R$ 169,80" → 16980 (centavos)
 * Também aceita "169,80" ou "169.80"
 */
function parseBrlPrice(price: string | undefined): number {
  if (!price) return 0;
  // Remove "R$", espaços, pontos de milhar
  const cleaned = price.replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".").trim();
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/* ─── Adapter ──────────────────────────────────────────────── */

export const kirvanoAdapter: ProviderAdapter = {
  provider: "kirvano",

  validateAuth(
    request: Request,
    _rawBody: string,
    body: unknown,
    credentials: Record<string, string>,
  ): boolean {
    const storedSecret = credentials.webhook_secret ?? "";
    if (!storedSecret) return false;

    // Tentamos múltiplos headers (nome não documentado oficialmente)
    const headerToken =
      request.headers.get("x-webhook-secret") ??
      request.headers.get("x-kirvano-secret") ??
      request.headers.get("x-kirvano-token") ??
      request.headers.get("authorization")?.replace("Bearer ", "") ??
      "";
    if (headerToken && headerToken === storedSecret) return true;

    // Fallback: campo token no body
    const payload = body as KirvanoPayload;
    if (payload?.token && payload.token === storedSecret) return true;

    return false;
  },

  normalizeEvent(body: unknown): NormalizedEvent | null {
    const payload = body as KirvanoPayload;
    const event = payload?.event ?? "";
    const eventType = EVENT_MAP[event];

    if (!eventType) return null;

    const customer = payload.customer;
    // Pegar o primeiro produto (não order bump) como principal
    const mainProduct = payload.products?.find((p) => !p.is_order_bump) ?? payload.products?.[0];

    // Amount: total_price é string formatada "R$ 169,80"
    const amountCents = parseBrlPrice(payload.total_price);

    // Payment method
    const rawPayment = payload.payment?.method ?? payload.payment_method ?? "";
    const paymentMethod = (PAYMENT_MAP[rawPayment] ?? rawPayment.toLowerCase()) || "kirvano";

    // Subscription
    const isSubscription = payload.type === "RECURRING";
    let subscriptionStatus: NormalizedEvent["subscriptionStatus"];
    if (isSubscription) {
      if (eventType === "cancelled" || eventType === "refunded" || eventType === "chargeback") {
        subscriptionStatus = "cancelled";
      } else if (eventType === "pending") {
        subscriptionStatus = "past_due";
      } else {
        subscriptionStatus = "active";
      }
    }

    // Order bumps: processar cada produto como evento separado seria complexo.
    // Por enquanto mapeamos só o produto principal. Bumps ficam para fase futura.

    return {
      eventType,
      externalOrderId: payload.sale_id ?? payload.checkout_id ?? "",
      externalProductId: mainProduct?.id ? String(mainProduct.id) : "",
      buyer: {
        email: customer?.email?.trim().toLowerCase() ?? "",
        name: customer?.name?.trim() || customer?.email?.trim().toLowerCase() || "",
        phone: customer?.phone_number?.trim() || undefined,
        document: customer?.document?.trim() || undefined,
        documentType: customer?.document ? "CPF" : undefined,
      },
      amountCents,
      paymentMethod,
      currency: "BRL",
      isSubscription,
      subscriptionStatus,
      isOrderBump: false,
      orderCreatedAt: payload.created_at || undefined,
      rawEvent: event,
    };
  },
};
