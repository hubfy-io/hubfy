/**
 * Sync Adapter Registry
 *
 * Mapeia provider → SyncAdapter para listing de produtos.
 * Espelho do adapters/index.ts (que mapeia provider → ProviderAdapter para webhooks).
 *
 * Para adicionar um novo gateway com API de produtos:
 * 1. Criar {provider}-api.ts com fetch + normalize
 * 2. Registrar aqui
 */

import type { SyncAdapter, SalesSyncAdapter } from "./sync-types.ts";
import {
  parseHotmartCredentials,
  getAccessToken as getHotmartToken,
  fetchProducts as fetchHotmartProducts,
  normalizeHotmartProducts,
  fetchHotmartSales,
  normalizeHotmartSales,
} from "./hotmart-api.ts";
import {
  getKiwifyAccessToken,
  fetchKiwifyProducts,
  normalizeKiwifyProducts,
  fetchKiwifySales,
  normalizeKiwifySales,
} from "./kiwify-api.ts";

/* ─── Hotmart Sync Adapter ───────────────────────────────── */

const hotmartSyncAdapter: SyncAdapter = {
  async fetchAndNormalize(credentials, existingMappings) {
    const creds = parseHotmartCredentials(credentials.basic_auth);
    const token = await getHotmartToken(creds);
    const products = await fetchHotmartProducts(token);
    return normalizeHotmartProducts(products, existingMappings);
  },
};

/* ─── Kiwify Sync Adapter ────────────────────────────────── */

const kiwifySyncAdapter: SyncAdapter = {
  async fetchAndNormalize(credentials, existingMappings) {
    const token = await getKiwifyAccessToken({
      accountId: credentials.account_id,
      apiKey: credentials.api_key,
      clientSecret: credentials.client_secret,
    });
    const products = await fetchKiwifyProducts(token, credentials.account_id);
    return normalizeKiwifyProducts(products, existingMappings);
  },
};

/* ─── Registry ───────────────────────────────────────────── */

const SYNC_ADAPTERS: Record<string, SyncAdapter> = {
  hotmart: hotmartSyncAdapter,
  kiwify: kiwifySyncAdapter,
};

export function getSyncAdapter(provider: string): SyncAdapter | null {
  return SYNC_ADAPTERS[provider] ?? null;
}

export const SYNC_PROVIDERS = Object.keys(SYNC_ADAPTERS);

/* ═══════════════════════════════════════════════════════════
 * Sales Sync Adapters
 * ═══════════════════════════════════════════════════════════ */

const hotmartSalesSyncAdapter: SalesSyncAdapter = {
  async fetchAndNormalize(credentials, dateRange, existingOrderIds, productMappings) {
    const creds = parseHotmartCredentials(credentials.basic_auth);
    const token = await getHotmartToken(creds);
    const sales = await fetchHotmartSales(token, dateRange.startMs, dateRange.endMs);
    return normalizeHotmartSales(sales, existingOrderIds, productMappings);
  },
};

const kiwifySalesSyncAdapter: SalesSyncAdapter = {
  async fetchAndNormalize(credentials, dateRange, existingOrderIds, productMappings) {
    const token = await getKiwifyAccessToken({
      accountId: credentials.account_id,
      apiKey: credentials.api_key,
      clientSecret: credentials.client_secret,
    });
    const startDate = new Date(dateRange.startMs).toISOString();
    const endDate = new Date(dateRange.endMs).toISOString();
    const sales = await fetchKiwifySales(token, credentials.account_id, startDate, endDate);
    return normalizeKiwifySales(sales, existingOrderIds, productMappings);
  },
};

const SALES_SYNC_ADAPTERS: Record<string, SalesSyncAdapter> = {
  hotmart: hotmartSalesSyncAdapter,
  kiwify: kiwifySalesSyncAdapter,
};

export function getSalesSyncAdapter(provider: string): SalesSyncAdapter | null {
  return SALES_SYNC_ADAPTERS[provider] ?? null;
}
