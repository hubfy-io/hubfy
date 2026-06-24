/**
 * Adapter Registry
 *
 * Mapeia provider name → adapter.
 * Para adicionar um novo gateway, basta importar e adicionar aqui.
 */

import type { ProviderAdapter } from "../types.ts";
import { hotmartAdapter } from "./hotmart.ts";
import { kiwifyAdapter } from "./kiwify.ts";
import { kirvanoAdapter } from "./kirvano.ts";
import { lastlinkAdapter } from "./lastlink.ts";
import { greennAdapter } from "./greenn.ts";

const ADAPTERS: Record<string, ProviderAdapter> = {
  hotmart: hotmartAdapter,
  kiwify: kiwifyAdapter,
  kirvano: kirvanoAdapter,
  lastlink: lastlinkAdapter,
  greenn: greennAdapter,
};

export function getAdapter(provider: string): ProviderAdapter | null {
  return ADAPTERS[provider] ?? null;
}

export const KNOWN_PROVIDERS = Object.keys(ADAPTERS);
