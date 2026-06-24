/**
 * Greenn Adapter
 *
 * Docs: https://greenn.crisp.help/pt-br/article/documentacao-webhook-greenn-cbbxsl/
 *
 * Eventos suportados (Fase 1 — apenas webhook):
 *   - type="sale" + event="saleUpdated"        → venda avulsa muda de status
 *   - type="contract" + event="contractUpdated" → assinatura muda de status
 *   - type="lead" + event="checkoutAbandoned"   → IGNORADO nesta fase (retorna null)
 *
 * A Greenn usa um único `event` por tipo e a informação relevante está em `currentStatus`.
 * Por isso mapeamos via (type + currentStatus) em vez de via `event`.
 *
 * Auth: token estático "Webhook Token" gerado em Configurações → Integrações e Tokens → Webhook
 * no painel da Greenn. Formato bcrypt (`$2y$10$...`). O nome do header que a Greenn usa
 * para enviar o token não é documentado — tentamos múltiplos padrões + fallback no body.
 */

import type { GatewayEventType, NormalizedEvent, ProviderAdapter } from "../types.ts";

/* ─── Tipos do payload Greenn (flat, conforme doc) ────────────── */

interface GreennClient {
  id?: number;
  name?: string;
  email?: string;
  cellphone?: string;
  cpf_cnpj?: string;
  city?: string;
  neighborhood?: string;
  number?: string;
  street?: string;
  complement?: string;
  zipcode?: string;
  uf?: string;
  created_at?: string;
  updated_at?: string;
}

interface GreennProduct {
  id?: number;
  name?: string;
  amount?: number;
  type?: string; // "TRANSACTIOM" (sic, typo na doc) | "SUBSCRIPTION"
  method?: string; // "CREDIT_CARD" | "BOLETO" | "PIX" | ...
  is_active?: number;
  period?: number;
  description?: string;
  thank_you_page?: string;
}

interface GreennSale {
  id?: number;
  status?: string;
  seller_id?: number;
  client_id?: number;
  method?: string;
  amount?: number;
  installments?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
  coupon?: unknown;
}

interface GreennContract {
  id?: number;
  status?: string;
  start_date?: string;
  current_period_end?: string;
  created_at?: string;
  updated_at?: string;
}

interface GreennPayload {
  type?: string; // "sale" | "contract" | "lead"
  event?: string;
  oldStatus?: string;
  currentStatus?: string;
  product?: GreennProduct;
  sale?: GreennSale;
  currentSale?: GreennSale;
  contract?: GreennContract;
  client?: GreennClient;
  // Possíveis campos de token no body (nome não documentado)
  token?: string;
  webhook_token?: string;
}

/* ─── Mapeamentos ──────────────────────────────────────────────── */

const SALE_STATUS_MAP: Record<string, GatewayEventType> = {
  paid: "approved",
  waiting_payment: "pending",
  refused: "cancelled",
  refunded: "refunded",
  chargedback: "chargeback",
};

const CONTRACT_STATUS_MAP: Record<string, GatewayEventType> = {
  paid: "approved",
  trialing: "approved",
  pending_payment: "pending",
  unpaid: "cancelled",
  canceled: "cancelled",
};

const PAYMENT_MAP: Record<string, string> = {
  CREDIT_CARD: "credit_card",
  TWO_CREDIT_CARDS: "credit_card",
  BOLETO: "billet",
  PIX: "pix",
  PAYPAL: "paypal",
};

/* ─── Helpers ──────────────────────────────────────────────────── */

/**
 * Converte timestamp Greenn ("YYYY-MM-DD HH:mm:ss") para ISO.
 * Retorna undefined se vazio ou inválido.
 */
function parseGreennTimestamp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Greenn não documenta timezone; assumimos UTC para evitar drift.
  const normalized = value.includes("T") ? value : value.replace(" ", "T") + "Z";
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/**
 * Infere tipo de documento por quantidade de dígitos.
 * CPF = 11 dígitos, CNPJ = 14 dígitos.
 */
function inferDocumentType(document: string | undefined): string | undefined {
  if (!document) return undefined;
  const digits = document.replace(/\D/g, "");
  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";
  return undefined;
}

/* ─── Adapter ──────────────────────────────────────────────────── */

export const greennAdapter: ProviderAdapter = {
  provider: "greenn",

  validateAuth(
    request: Request,
    _rawBody: string,
    body: unknown,
    credentials: Record<string, string>,
  ): boolean {
    const stored = credentials.webhook_token ?? "";
    if (!stored) return false;

    // Nome do header não é documentado — tentamos os mais prováveis.
    const headerToken =
      request.headers.get("x-greenn-token") ??
      request.headers.get("x-webhook-token") ??
      request.headers.get("x-greenn-webhook-token") ??
      request.headers.get("x-webhook-secret") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (headerToken && headerToken === stored) return true;

    // Fallback: campo no body (comum em webhooks sem header padrão).
    const payload = body as GreennPayload;
    const bodyToken = payload?.token ?? payload?.webhook_token ?? "";
    if (bodyToken && bodyToken === stored) return true;

    return false;
  },

  normalizeEvent(body: unknown): NormalizedEvent | null {
    const payload = body as GreennPayload;
    const type = payload?.type ?? "";
    const currentStatus = payload?.currentStatus ?? "";

    // Fase 1: ignoramos leads (checkoutAbandoned).
    if (type === "lead") return null;

    let eventType: GatewayEventType | undefined;
    let isSubscription = false;
    let externalOrderId = "";
    let subscriptionStatus: NormalizedEvent["subscriptionStatus"];
    let sale: GreennSale | undefined;

    if (type === "sale") {
      eventType = SALE_STATUS_MAP[currentStatus];
      sale = payload.sale;
      externalOrderId = sale?.id != null ? String(sale.id) : "";
      isSubscription = payload.product?.type === "SUBSCRIPTION";

      // Pra sale de produto subscription, subscription status segue o event type.
      if (isSubscription) {
        if (eventType === "approved") subscriptionStatus = "active";
        else if (eventType === "cancelled" || eventType === "refunded" || eventType === "chargeback") {
          subscriptionStatus = "cancelled";
        } else if (eventType === "pending") {
          subscriptionStatus = "past_due";
        }
      }
    } else if (type === "contract") {
      eventType = CONTRACT_STATUS_MAP[currentStatus];
      sale = payload.currentSale;
      // Usamos contract.id como externalOrderId pra garantir 1 order por assinatura:
      // cada evento contractUpdated atualiza a mesma row, e cancelamento revoga access.
      externalOrderId = payload.contract?.id != null ? String(payload.contract.id) : "";
      isSubscription = true;

      if (currentStatus === "paid" || currentStatus === "trialing") {
        subscriptionStatus = "active";
      } else if (currentStatus === "pending_payment") {
        subscriptionStatus = "past_due";
      } else if (currentStatus === "unpaid" || currentStatus === "canceled") {
        subscriptionStatus = "cancelled";
      }
    } else {
      // Tipo desconhecido — ignora.
      return null;
    }

    if (!eventType || !externalOrderId) return null;

    const client = payload.client;
    const product = payload.product;

    // Payment method: prioriza sale.method, fallback product.method.
    const rawPayment = sale?.method || product?.method || "";
    const paymentMethod = PAYMENT_MAP[rawPayment] ?? (rawPayment ? rawPayment.toLowerCase() : "greenn");

    // Amount: Greenn manda em reais como número (ex: 99 ou 99.90).
    // Convertemos pra centavos. Se empiricamente descobrirmos que já vem em centavos, ajustamos aqui.
    const amountRaw = sale?.amount ?? product?.amount ?? 0;
    const amountCents = Math.round(Number(amountRaw) * 100);

    const document = client?.cpf_cnpj?.trim();
    const documentType = inferDocumentType(document);

    const hasAddress = !!(client?.city || client?.uf || client?.zipcode);

    return {
      eventType,
      externalOrderId,
      externalProductId: product?.id != null ? String(product.id) : "",
      buyer: {
        email: client?.email?.trim().toLowerCase() ?? "",
        name: client?.name?.trim() || client?.email?.trim().toLowerCase() || "",
        phone: client?.cellphone?.trim() || undefined,
        document: document || undefined,
        documentType,
        address: hasAddress ? {
          city: client?.city?.trim() || undefined,
          state: client?.uf?.trim() || undefined,
          country: "BR",
          zipcode: client?.zipcode?.trim() || undefined,
        } : undefined,
      },
      amountCents,
      paymentMethod,
      currency: "BRL",
      isSubscription,
      subscriptionStatus,
      isOrderBump: false,
      orderCreatedAt: parseGreennTimestamp(sale?.created_at),
      rawEvent: `${type}.${currentStatus}`,
    };
  },
};
