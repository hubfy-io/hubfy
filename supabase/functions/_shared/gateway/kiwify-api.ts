/**
 * Kiwify REST API helpers.
 *
 * OAuth2 via /oauth/token + endpoints de catálogo.
 * Usado pelo gateway-sync para importar dados da Kiwify.
 *
 * Docs: https://docs.kiwify.com.br
 * Base URL: https://public-api.kiwify.com
 * Rate limit: 100 req/min
 */

import type { NormalizedGatewayProduct, NormalizedGatewaySale } from "./sync-types.ts";

const BASE_URL = "https://public-api.kiwify.com";

export interface KiwifyProduct {
  id: string;
  name: string;
  type: string;
  status: string;
  price: number | null;
  currency: string;
  payment_type: string;
  created_at: string;
}

export interface KiwifyCredentials {
  accountId: string;
  apiKey: string;
  clientSecret: string;
}

/**
 * OAuth2 → access_token.
 * Usa expires_in retornado pelo endpoint (nunca hardcoda TTL).
 */
export async function getKiwifyAccessToken(
  creds: KiwifyCredentials,
): Promise<string> {
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: creds.apiKey,
      client_secret: creds.clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Kiwify token error:", body);
    throw new Error(
      "Falha ao autenticar na Kiwify. Verifique as credenciais da API.",
    );
  }

  const data = await res.json();
  return data.access_token as string;
}

/**
 * Lista todos os produtos do vendedor na Kiwify.
 * Percorre todas as páginas automaticamente.
 */
export async function fetchKiwifyProducts(
  accessToken: string,
  accountId: string,
): Promise<KiwifyProduct[]> {
  const all: KiwifyProduct[] = [];
  let page = 1;

  while (true) {
    const url = `${BASE_URL}/v1/products?page_number=${page}&page_size=50`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-kiwify-account-id": accountId,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Kiwify products error:", body);
      throw new Error("Falha ao listar produtos da Kiwify.");
    }

    const data = await res.json();
    const items: unknown[] = data.data ?? [];

    for (const p of items) {
      const item = p as Record<string, unknown>;
      all.push({
        id: String(item.id),
        name: String(item.name ?? ""),
        type: String(item.type ?? ""),
        status: String(item.status ?? ""),
        price: item.price != null ? Number(item.price) : null,
        currency: String(item.currency ?? "BRL"),
        payment_type: String(item.payment_type ?? ""),
        created_at: String(item.created_at ?? ""),
      });
    }

    const pagination = data.pagination as Record<string, number> | undefined;
    if (!pagination || items.length < (pagination.page_size ?? 50)) break;
    page++;
  }

  return all;
}

/* ─── Normalização ───────────────────────────────────────── */

function normalizeKiwifyStatus(raw: string): NormalizedGatewayProduct["status"] {
  if (raw === "active") return "active";
  return "inactive";
}

/**
 * Converte KiwifyProduct[] → NormalizedGatewayProduct[].
 *
 * existingMappings: Map<external_product_id, product_id | null>
 */
export function normalizeKiwifyProducts(
  products: KiwifyProduct[],
  existingMappings: Map<string, string | null>,
): NormalizedGatewayProduct[] {
  return products.map((kp) => {
    const mappedProductId = existingMappings.get(kp.id);
    const alreadyImported = mappedProductId !== undefined && mappedProductId !== null;

    return {
      external_id: kp.id,
      name: kp.name,
      status: normalizeKiwifyStatus(kp.status),
      is_subscription: kp.payment_type === "recurring",
      price_cents: kp.price,
      currency: kp.currency || null,
      warranty_days: null,
      created_at: kp.created_at || null,
      already_imported: alreadyImported,
      ...(alreadyImported && { existing_product_id: mappedProductId }),
    };
  });
}

/* ═══════════════════════════════════════════════════════════
 * Sales — Listagem de vendas
 * ═══════════════════════════════════════════════════════════ */

export interface KiwifySale {
  id: string;
  reference?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  product?: { id?: string; name?: string };
  status?: string;
  payment_method?: string;
  net_amount?: number;
  currency?: string;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    cpf?: string;
    mobile?: string;
    cnpj?: string;
    instagram?: string;
    country?: string;
    address?: {
      city?: string;
      state?: string;
      zipcode?: string;
    };
  };
}

/** Mapeamento de status API de vendas → order_status Hubfy (consistente com webhook adapter) */
const SALE_STATUS_MAP: Record<string, string> = {
  paid: "approved",
  approved: "approved",
  completed: "completed",
  refunded: "refunded",
  chargedback: "chargeback",
  // pending, waiting_payment, refused, processing → não importamos
};

/** Mapeamento de payment_method → normalizado (consistente com webhook adapter) */
const SALE_PAYMENT_MAP: Record<string, string> = {
  credit_card: "credit_card",
  pix: "pix",
  boleto: "billet",
};

/**
 * Lista vendas da Kiwify para um período (máx 90 dias).
 * Percorre todas as páginas automaticamente.
 */
export async function fetchKiwifySales(
  accessToken: string,
  accountId: string,
  startDate: string,
  endDate: string,
): Promise<KiwifySale[]> {
  const all: KiwifySale[] = [];
  let page = 1;

  while (true) {
    const url =
      `${BASE_URL}/v1/sales?page_number=${page}&page_size=50` +
      `&start_date=${encodeURIComponent(startDate)}` +
      `&end_date=${encodeURIComponent(endDate)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-kiwify-account-id": accountId,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Kiwify sales error:", body);
      throw new Error("Falha ao listar vendas da Kiwify.");
    }

    const data = await res.json();
    const items: unknown[] = data.data ?? [];

    for (const item of items) {
      all.push(item as KiwifySale);
    }

    const pagination = data.pagination as Record<string, number> | undefined;
    if (!pagination || items.length < (pagination.page_size ?? 50)) break;
    page++;
  }

  return all;
}

/**
 * Normaliza vendas da Kiwify para NormalizedGatewaySale[].
 */
export function normalizeKiwifySales(
  sales: KiwifySale[],
  existingOrderIds: Set<string>,
  productMappings: Map<string, string | null>,
): NormalizedGatewaySale[] {
  return sales.map((s) => {
    const externalOrderId = s.id;
    const externalProductId = s.product?.id ?? "";
    const rawStatus = s.status ?? "";
    const status = SALE_STATUS_MAP[rawStatus] ?? rawStatus;
    const rawPayment = s.payment_method ?? "";
    const paymentMethod = SALE_PAYMENT_MAP[rawPayment] || "kiwify";

    const mappedProductId = productMappings.get(externalProductId);
    const productMapped = mappedProductId !== undefined && mappedProductId !== null;

    const email = (s.customer?.email ?? "").trim().toLowerCase();
    const customerName = (s.customer?.name ?? "").trim();
    const document = (s.customer?.cpf || s.customer?.cnpj || "").trim() || undefined;
    const documentType = s.customer?.cpf ? "CPF" : s.customer?.cnpj ? "CNPJ" : undefined;

    return {
      external_order_id: externalOrderId,
      external_product_id: externalProductId,
      product_name: s.product?.name ?? "",
      buyer: {
        email,
        name: customerName || email,
        phone: s.customer?.mobile?.trim() || undefined,
        document,
        documentType,
        ...(s.customer?.address && (s.customer.address.city || s.customer.address.state) && {
          address: {
            city: s.customer.address.city?.trim() || undefined,
            state: s.customer.address.state?.trim() || undefined,
            country: s.customer?.country?.trim() || undefined,
            zipcode: s.customer.address.zipcode?.trim() || undefined,
          },
        }),
      },
      amount_cents: s.net_amount ?? 0,
      currency: s.currency ?? "BRL",
      status,
      payment_method: paymentMethod,
      is_subscription: s.type === "subscription",
      order_date: s.created_at ?? new Date().toISOString(),
      already_imported: existingOrderIds.has(externalOrderId),
      product_mapped: productMapped,
      ...(productMapped && { hubfy_product_id: mappedProductId }),
    };
  });
}
