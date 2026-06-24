/**
 * Kiwify Adapter
 *
 * Docs: https://docs.kiwify.com.br / https://ajuda.kiwify.com.br
 *
 * Payload real (confirmado):
 *   - Objetos aninhados em PascalCase: Product, Customer, Commissions, Subscription
 *   - order_status: "paid" | "completed" | "refunded" | "chargedback" | "waiting_payment" | "refused"
 *   - Commissions.charge_amount é STRING em centavos: "8063" = R$80,63
 *   - Triggers de subscription: subscription_canceled, subscription_late, subscription_renewed
 *     (chegam como order_status separado ou campo adicional — tratar via sale_type ou subscription.status)
 *
 * Auth: token estático configurado no webhook.
 *   - A Kiwify NÃO documenta oficialmente o header. O token pode vir como:
 *     (a) Header x-kiwify-signature (mais comum em integrações)
 *     (b) Body field "signature" ou "token"
 *   - Checamos header primeiro, depois body.
 */

import type { NormalizedEvent, ProviderAdapter } from "../types.ts";

/* ─── Tipos do payload Kiwify (PascalCase confirmado) ────── */

interface KiwifyPayload {
  order_id?: string;
  order_ref?: string;
  order_status?:
    | "paid"
    | "waiting_payment"
    | "refused"
    | "refunded"
    | "chargedback"
    | "completed";
  Product?: {
    product_id?: string;
    product_name?: string;
  };
  Customer?: {
    full_name?: string;
    email?: string;
    mobile?: string;
    CPF?: string;
  };
  Commissions?: {
    charge_amount?: number | string;
    product_base_price?: number | string;
    kiwify_fee?: number | string;
    my_commission?: number | string;
    currency_code?: string;
    funds_status?: string | null;
    estimated_deposit_date?: string | null;
  };
  Subscription?: {
    start_date?: string;
    next_payment?: string;
    id?: string;
    status?: string;
  };
  payment_method?: string;
  sale_type?: string;
  installments?: number;
  card_type?: string;
  card_last4digits?: string;
  created_at?: string;
  updated_at?: string;
  approved_date?: string;
  // Possível campo de token/signature no body
  signature?: string;
  token?: string;
}

/* ─── Mapeamentos ──────────────────────────────────────────── */

const EVENT_STATUS_MAP: Record<string, NormalizedEvent["eventType"]> = {
  paid: "approved",
  completed: "completed",
  refunded: "refunded",
  chargedback: "chargeback",
  waiting_payment: "pending",
  // refused → não processamos (não cria order)
};

const PAYMENT_MAP: Record<string, string> = {
  credit_card: "credit_card",
  pix: "pix",
  boleto: "billet",
};

/* ─── Adapter ──────────────────────────────────────────────── */

export const kiwifyAdapter: ProviderAdapter = {
  provider: "kiwify",

  validateAuth(
    request: Request,
    _rawBody: string,
    body: unknown,
    credentials: Record<string, string>,
  ): boolean {
    const storedSecret = credentials.webhook_secret ?? "";
    if (!storedSecret) return false;

    // Tentativa 1: header (convenção mais comum)
    const headerSig =
      request.headers.get("x-kiwify-signature") ??
      request.headers.get("x-webhook-token") ??
      "";
    if (headerSig && headerSig === storedSecret) return true;

    // Tentativa 2: campo no body (signature ou token)
    const payload = body as KiwifyPayload;
    const bodySig = payload?.signature ?? payload?.token ?? "";
    if (bodySig && bodySig === storedSecret) return true;

    return false;
  },

  normalizeEvent(body: unknown): NormalizedEvent | null {
    const payload = body as KiwifyPayload;
    const status = payload?.order_status ?? "";
    const eventType = EVENT_STATUS_MAP[status];

    if (!eventType) return null;

    const customer = payload.Customer;
    const product = payload.Product;
    const subscription = payload.Subscription;
    const commissions = payload.Commissions;

    // Amount: charge_amount vem como string em centavos ("8063")
    const rawAmount = commissions?.charge_amount;
    let amountCents: number;
    if (typeof rawAmount === "string") {
      amountCents = parseInt(rawAmount, 10) || 0;
    } else {
      amountCents = rawAmount ?? 0;
    }

    // Currency
    const currency = commissions?.currency_code ?? "BRL";

    // Payment method
    const rawPayment = payload.payment_method ?? "";
    const paymentMethod = (PAYMENT_MAP[rawPayment] ?? rawPayment) || "kiwify";

    // Subscription
    const isSubscription = !!subscription?.id || payload.sale_type === "subscription";
    let subscriptionStatus: NormalizedEvent["subscriptionStatus"];
    if (isSubscription) {
      if (eventType === "refunded" || eventType === "chargeback") {
        subscriptionStatus = "cancelled";
      } else if (eventType === "pending") {
        subscriptionStatus = "past_due";
      } else {
        subscriptionStatus = "active";
      }
    }

    return {
      eventType,
      externalOrderId: payload.order_id ?? "",
      externalProductId: product?.product_id ? String(product.product_id) : "",
      buyer: {
        email: customer?.email?.trim().toLowerCase() ?? "",
        name: customer?.full_name?.trim() || customer?.email?.trim().toLowerCase() || "",
        phone: customer?.mobile?.trim() || undefined,
        document: customer?.CPF?.trim() || undefined,
        documentType: customer?.CPF ? "CPF" : undefined,
      },
      amountCents,
      paymentMethod,
      currency,
      isSubscription,
      subscriptionStatus,
      isOrderBump: false,
      orderCreatedAt: payload.approved_date || payload.created_at || undefined,
      rawEvent: status,
    };
  },
};
