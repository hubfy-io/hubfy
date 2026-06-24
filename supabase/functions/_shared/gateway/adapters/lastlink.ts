/**
 * Lastlink Adapter
 *
 * Docs: https://support.lastlink.com/pt-BR/articles/12587805
 *
 * Payload real (confirmado):
 *   - Tudo em PascalCase: { Id, IsTest, Event, CreatedAt, Data: { ... } }
 *   - Eventos: Purchase_Order_Confirmed, Payment_Refund, Payment_Chargeback,
 *     Subscription_Canceled, Purchase_Request_Canceled, Recurrent_Payment, etc.
 *   - Products é ARRAY: [{ Id, Name, Price }]
 *   - Price é decimal (100.0 = R$100), NÃO centavos
 *   - Buyer: { Id, Email, Name, PhoneNumber, Document, Address }
 *   - Purchase: { PaymentId, Price: { Value }, Payment: { PaymentMethod } }
 *
 * Auth: token configurado no webhook.
 *   - Nome do header NÃO documentado oficialmente.
 */

import type { NormalizedEvent, ProviderAdapter } from "../types.ts";

/* ─── Tipos do payload Lastlink (PascalCase, confirmado) ──── */

interface LastlinkPayload {
  Id?: string;
  IsTest?: boolean;
  Event?: string;
  CreatedAt?: string;
  Data?: {
    Products?: Array<{
      Id?: string;
      Name?: string;
      Price?: number; // decimal: 100.0 = R$100
    }>;
    Product?: {
      Id?: string;
      Name?: string;
      Price?: number;
    };
    Buyer?: {
      Id?: string;
      Email?: string;
      Name?: string;
      PhoneNumber?: string;
      Document?: string;
      Address?: {
        ZipCode?: string;
        Street?: string;
        StreetNumber?: string;
        Complement?: string;
        District?: string;
        City?: string;
        State?: string;
      };
    };
    Seller?: {
      Id?: string;
      Email?: string;
    };
    Purchase?: {
      PaymentId?: string;
      Recurrency?: number;
      PaymentDate?: string;
      ChargebackDate?: string | null;
      OriginalPrice?: { Value?: number };
      Price?: { Value?: number };
      Payment?: {
        NumberOfInstallments?: number;
        PaymentMethod?: string; // "credit_card" | "pix" | "bankslip"
      };
      Affiliate?: { Id?: string; Email?: string };
    };
    Subscriptions?: Array<{
      Id?: string;
      ProductId?: string;
      CanceledDate?: string | null;
      CancellationReason?: string | null;
      ExpiredDate?: string | null;
    }>;
    Offer?: {
      Id?: string;
      Name?: string;
      Url?: string;
    };
    // Campos de acesso (Product_Access_Started etc.)
    Member?: { Id?: string; Email?: string };
    AccessType?: string;
    AccessStartedAt?: string;
    AccessEndedAt?: string;
  };
}

/* ─── Mapeamentos ──────────────────────────────────────────── */

const EVENT_MAP: Record<string, NormalizedEvent["eventType"]> = {
  Purchase_Order_Confirmed: "approved",
  Recurrent_Payment: "approved",
  Payment_Refund: "refunded",
  Refund_Requested: "refunded",
  Payment_Chargeback: "chargeback",
  Purchase_Request_Canceled: "cancelled",
  Subscription_Canceled: "cancelled",
  Subscription_Expired: "cancelled",
  Purchase_Request_Confirmed: "pending", // fatura criada (boleto/pix pendente)
  Purchase_Request_Expired: "cancelled",
  Subscription_Renewal_Pending: "pending",
};

const PAYMENT_MAP: Record<string, string> = {
  credit_card: "credit_card",
  pix: "pix",
  bankslip: "billet",
};

/* ─── Adapter ──────────────────────────────────────────────── */

export const lastlinkAdapter: ProviderAdapter = {
  provider: "lastlink",

  validateAuth(
    request: Request,
    _rawBody: string,
    _body: unknown,
    credentials: Record<string, string>,
  ): boolean {
    const storedSecret = credentials.webhook_secret ?? "";
    if (!storedSecret) return false;

    // Tentamos múltiplos headers (nome não documentado oficialmente)
    const headerToken =
      request.headers.get("x-lastlink-token") ??
      request.headers.get("x-webhook-token") ??
      request.headers.get("x-webhook-secret") ??
      request.headers.get("authorization")?.replace("Bearer ", "") ??
      "";
    if (headerToken && headerToken === storedSecret) return true;

    return false;
  },

  normalizeEvent(body: unknown): NormalizedEvent | null {
    const payload = body as LastlinkPayload;
    const event = payload?.Event ?? "";
    const eventType = EVENT_MAP[event];

    if (!eventType) return null;

    const data = payload.Data;
    const buyer = data?.Buyer;
    const purchase = data?.Purchase;
    const subscriptions = data?.Subscriptions;

    // Produto principal: Products[0] ou Product (varia por evento)
    const mainProduct = data?.Products?.[0] ?? data?.Product;

    // Amount: Price.Value é decimal (100.0 = R$100,00) → converter pra centavos
    const priceValue = purchase?.Price?.Value ?? purchase?.OriginalPrice?.Value ?? mainProduct?.Price ?? 0;
    const amountCents = Math.round(priceValue * 100);

    // Payment method
    const rawPayment = purchase?.Payment?.PaymentMethod ?? "";
    const paymentMethod = (PAYMENT_MAP[rawPayment] ?? rawPayment) || "lastlink";

    // Subscription
    const isSubscription = (subscriptions && subscriptions.length > 0) || (purchase?.Recurrency ?? 0) > 1;
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

    // External order ID: PaymentId do Purchase (mais específico) ou Id do evento
    const externalOrderId = purchase?.PaymentId ?? payload.Id ?? "";

    return {
      eventType,
      externalOrderId,
      externalProductId: mainProduct?.Id ? String(mainProduct.Id) : "",
      buyer: {
        email: buyer?.Email?.trim().toLowerCase() ?? "",
        name: buyer?.Name?.trim() || buyer?.Email?.trim().toLowerCase() || "",
        phone: buyer?.PhoneNumber?.trim() || undefined,
        document: buyer?.Document?.trim() || undefined,
        documentType: buyer?.Document ? "CPF" : undefined,
        address: buyer?.Address
          ? {
              city: buyer.Address.City || undefined,
              state: buyer.Address.State || undefined,
              zipcode: buyer.Address.ZipCode || undefined,
            }
          : undefined,
      },
      amountCents,
      paymentMethod,
      currency: "BRL",
      isSubscription: !!isSubscription,
      subscriptionStatus,
      isOrderBump: false,
      orderCreatedAt: purchase?.PaymentDate || payload.CreatedAt || undefined,
      rawEvent: event,
    };
  },
};
