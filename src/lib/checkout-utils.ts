/**
 * Shared helpers for checkout formatting.
 * Used by both CheckoutPage (public) and CheckoutPreview (admin).
 */

export function formatCurrency(cents: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function contrastColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}

export function formatInterval(unit: string | null, qty: number | null): string {
  if (!unit) return "/ uma única vez";
  const q = qty || 1;
  const labels: Record<string, [string, string]> = {
    day: ["dia", "dias"],
    week: ["semana", "semanas"],
    month: ["mês", "meses"],
    year: ["ano", "anos"],
  };
  const [singular, plural] = labels[unit] || [unit, unit];
  if (q === 1) return `/ ${singular}`;
  return `/ ${q} ${plural}`;
}

export interface PriceLabelParams {
  unit_amount: number;
  currency: string;
  price_category?: string | null;
  renewal_interval_unit?: string | null;
  renewal_interval_quantity?: number | null;
}

export function getPriceLabel(p: PriceLabelParams): string {
  if (p.unit_amount === 0) return "Grátis";
  const price = formatCurrency(p.unit_amount, p.currency);
  if (p.price_category === "subscription") {
    return `${price} ${formatInterval(p.renewal_interval_unit ?? null, p.renewal_interval_quantity ?? null)}`;
  }
  if (p.price_category === "lead_magnet") return "Grátis";
  return `${price} / uma única vez`;
}

export function makeFocusHandlers(brandColor: string) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = brandColor;
      e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColor}20`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "#E0E0E0";
      e.currentTarget.style.boxShadow = "none";
    },
  };
}

export const inputBaseStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E0E0E0",
  color: "#1A1A1A",
};

/** Maps button style name to CSS border-radius value */
export function buttonRadius(style: string | null | undefined): string {
  switch (style) {
    case "rectangular":
      return "6px";
    case "rounded":
      return "10px";
    case "pill":
    default:
      return "9999px";
  }
}

/** Maps button style name to Tailwind class */
export function buttonRadiusClass(style: string | null | undefined): string {
  switch (style) {
    case "rectangular":
      return "rounded-md";
    case "rounded":
      return "rounded-[10px]";
    case "pill":
    default:
      return "rounded-full";
  }
}
