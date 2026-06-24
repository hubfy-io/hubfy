import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import {
  formatCurrency,
  contrastColor,
  getPriceLabel as getPriceLabelUtil,
  inputBaseStyle,
  buttonRadius,
} from "@/lib/checkout-utils";
import { translateAppError } from "@/lib/app-error-utils";

/* ─── Supabase REST config (no SDK import — saves ~46KB gzip) ─── */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://api.hubfy.io";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc3Bpd2Fua2Rua3FhZXpmaGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTg4MDAsImV4cCI6MjA4NTg5NDgwMH0.jqNC2ApZsRSZ711mj9AMeE42Fd4xjCyimN0qwPOIa8k";

function extractCacheBuster(url: string): string | null {
  const qIndex = url.indexOf("?");
  if (qIndex === -1) return null;
  const params = new URLSearchParams(url.slice(qIndex));
  return params.get("t");
}

function resolveVersionToken(version?: string | number | null): string | null {
  if (version == null || version === "") return null;
  if (typeof version === "number") return String(version);
  const parsed = Date.parse(version);
  return Number.isNaN(parsed) ? version : String(parsed);
}

function appendCacheBuster(url: string, cacheBuster: string | null): string {
  if (!cacheBuster) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${encodeURIComponent(cacheBuster)}`;
}

function stripQueryAndHash(value: string): string {
  const noHash = value.split("#", 1)[0];
  return noHash.split("?", 1)[0];
}

function buildPublicCoverUrl(pathOrUrl: string, version?: string | number | null): string {
  const raw = stripQueryAndHash(pathOrUrl.trim());
  if (!raw) return "";

  const cacheBuster = resolveVersionToken(version) ?? extractCacheBuster(pathOrUrl);

  if (raw.startsWith("http")) {
    return appendCacheBuster(raw, cacheBuster);
  }

  const normalized = raw.replace(/^\/+/, "");
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/covers/${normalized}`;
  return appendCacheBuster(publicUrl, cacheBuster);
}

async function fetchCheckout(smartId: string): Promise<CheckoutData | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ p_checkout_smart_id: smartId }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  return Array.isArray(data) ? data[0] : data;
}

async function submitCheckout(body: Record<string, unknown>): Promise<{ data?: { customer_portal_url?: string }; error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/process-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || data?.error) {
    return { error: data?.error || `Erro ${res.status}` };
  }
  return { data };
}

/* ─── Inline toast (avoids importing sonner — saves ~4KB gzip) ─── */

function showToast(message: string) {
  const el = document.createElement("div");
  el.textContent = message;
  Object.assign(el.style, {
    position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
    background: "#1A1A1A", color: "#FFF", padding: "10px 20px", borderRadius: "8px",
    fontSize: "14px", fontWeight: "500", zIndex: "9999", opacity: "0",
    transition: "opacity 0.2s", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = "1"; });
  setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 200); }, 3000);
}

/* ─── SVG icons inline (avoids importing lucide-react — saves ~13KB gzip) ─── */

const IconSpinner = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const IconCheck = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
  </svg>
);

const IconLock = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconArrowRight = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const IconShield = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />
  </svg>
);

/* ─── Font loader helper ─── */

function loadGoogleFont(family: string) {
  if (family === "Geist") return;
  const id = `gfont-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/* ─── Favicon helper ─── */

function setFavicon(url: string) {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

/* ─── Types ─── */

interface CheckoutData {
  id: string;
  smart_id: string;
  title: string | null;
  description: string | null;
  collect_phone: boolean;
  collect_address: boolean;
  collect_fiscal_id: boolean;
  allow_discount_codes: boolean;
  expires_at: string | null;
  cover_url: string | null;
  confirmation_message: string | null;
  success_url: string | null;
  product_name: string;
  product_cover_url: string | null;
  product_updated_at: string | null;
  product_status: string;
  unit_amount: number;
  currency: string;
  price_category: string | null;
  renewal_interval_unit: string | null;
  renewal_interval_quantity: number | null;
  tenant_name: string;
  tenant_slug: string;
  tenant_icon_url: string | null;
  tenant_primary_color: string | null;
  tenant_theme_mode: string | null;
  checkout_use_brand_colors: boolean | null;
  checkout_bg_color: string | null;
  checkout_button_color: string | null;
  checkout_button_style: string | null;
  checkout_font_family: string | null;
}

function getPriceLabel(checkout: CheckoutData): string {
  return getPriceLabelUtil({
    unit_amount: checkout.unit_amount,
    currency: checkout.currency,
    price_category: checkout.price_category,
    renewal_interval_unit: checkout.renewal_interval_unit,
    renewal_interval_quantity: checkout.renewal_interval_quantity,
  });
}

/* ─── Stable focus handlers ─── */

function handleFocus(e: React.FocusEvent<HTMLInputElement>, brandColor: string) {
  e.currentTarget.style.borderColor = brandColor;
  e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColor}20`;
}

function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#E0E0E0";
  e.currentTarget.style.boxShadow = "none";
}

/* ─── Component ─── */

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { checkoutSmartId } = useParams<{ checkoutSmartId: string }>();

  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [fiscalId, setFiscalId] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [portalUrl, setPortalUrl] = useState("");
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  /* ─── Fetch checkout data (plain fetch, no lib) ─── */
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!checkoutSmartId || fetchedRef.current) return;
    fetchedRef.current = true;

    fetchCheckout(checkoutSmartId)
      .then((data) => {
        setCheckout(data);
        if (!data) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [checkoutSmartId]);

  /* ─── Set favicon to tenant icon ─── */
  const tenantAvatarUrl = checkout?.tenant_icon_url || null;

  useEffect(() => {
    if (tenantAvatarUrl) setFavicon(tenantAvatarUrl);
    return () => { setFavicon("/brand/favicon-dark.svg"); };
  }, [tenantAvatarUrl]);

  /* ─── Load checkout font ─── */
  const checkoutFont = checkout?.checkout_font_family || "Geist";
  useEffect(() => { loadGoogleFont(checkoutFont); }, [checkoutFont]);

  /* ─── Memoized derived values ─── */
  const derived = useMemo(() => {
    if (!checkout) return null;

    const brandColor = checkout.tenant_primary_color || "#6366f1";
    const useBrand = checkout.checkout_use_brand_colors !== false;
    const isDark = checkout.tenant_theme_mode === "dark";
    const bgColor = useBrand ? (isDark ? "#0A0A0A" : "#F9F9F9") : (checkout.checkout_bg_color || "#F9F9F9");
    const btnColor = useBrand ? brandColor : (checkout.checkout_button_color || brandColor);
    const btnFg = contrastColor(btnColor);
    const btnRadius = buttonRadius(checkout.checkout_button_style);
    const fontBase = checkout.checkout_font_family || "Geist";
    const fontFamily = `${fontBase}, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
    const brandFg = contrastColor(brandColor);
    const isUnavailable = checkout.product_status !== "active";
    const displayTitle = isUnavailable ? t("checkout.productUnavailable") : checkout.title || checkout.product_name;
    const priceLabel = getPriceLabel(checkout);
    const displayPrice = checkout.unit_amount === 0 ? t("checkout.free") : formatCurrency(checkout.unit_amount, checkout.currency);
    const coverImage = checkout.cover_url
      ? buildPublicCoverUrl(checkout.cover_url)
      : checkout.product_cover_url
        ? buildPublicCoverUrl(checkout.product_cover_url, checkout.product_updated_at)
        : null;

    // Detect if left panel background is dark (custom bg or dark theme)
    const leftIsDark = useBrand ? isDark : (checkout.checkout_bg_color ? contrastColor(checkout.checkout_bg_color) === "#FFFFFF" : false);
    const leftTextPrimary = leftIsDark ? "#F5F5F5" : "#1A1A1A";
    const leftTextSecondary = leftIsDark ? "#A0A0A0" : "#666";
    const leftTextTertiary = leftIsDark ? "#777" : "#555";

    return {
      brandColor, bgColor, btnColor, btnFg, btnRadius,
      fontFamily, brandFg, isUnavailable, displayTitle,
      priceLabel, displayPrice, coverImage,
      leftIsDark, leftTextPrimary, leftTextSecondary, leftTextTertiary,
    };
  }, [checkout, t]);

  /* ─── Stable focus handlers ─── */
  const onFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => { if (derived) handleFocus(e, derived.brandColor); },
    [derived],
  );
  const onBlur = useCallback(handleBlur, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast(t("checkout.nameRequired")); return; }
    if (!email.trim()) { showToast(t("checkout.emailRequired")); return; }

    setSubmitting(true);
    try {
      const result = await submitCheckout({
        checkout_id: checkout!.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        fiscal_id: fiscalId.trim() || undefined,
        discount_code: discountCode.trim() || undefined,
        idempotency_key: idempotencyKeyRef.current,
      });

      if (result.error) throw new Error(result.error);

      setSuccess(true);
      setPortalUrl(result.data.customer_portal_url || `/${checkout?.tenant_slug}`);
    } catch (err: unknown) {
      showToast(translateAppError(err, t("checkout.processError")));
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center" style={{ background: "#F9F9F9" }}>
        <IconSpinner className="size-8 animate-spin" style={{ color: "#999" }} />
      </div>
    );
  }

  /* ─── Not found / expired ─── */
  if (error || !checkout || !derived) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4" style={{ background: "#F9F9F9" }}>
        <div className="size-16 rounded-full flex items-center justify-center" style={{ background: "#EFEFEF" }}>
          <IconLock className="size-7" style={{ color: "#999" }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: "#1A1A1A" }}>{t("checkout.notAvailable")}</h1>
        <p className="text-sm text-center max-w-xs" style={{ color: "#888" }}>
          {t("checkout.notAvailableDescription")}
        </p>
      </div>
    );
  }

  const {
    brandColor, bgColor, btnColor, btnFg, btnRadius,
    fontFamily, brandFg, isUnavailable, displayTitle,
    priceLabel, displayPrice, coverImage,
    leftIsDark, leftTextPrimary, leftTextSecondary, leftTextTertiary,
  } = derived;

  /* ─── Success state ─── */
  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4" style={{ background: bgColor, fontFamily }}>
        <div className="w-full max-w-md text-center space-y-6">
          <div className="size-20 rounded-full flex items-center justify-center mx-auto" style={{ background: `${btnColor}15` }}>
            <IconCheck className="size-10" style={{ color: btnColor }} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>{t("checkout.successTitle")}</h1>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "#666" }}>
              {t("checkout.successDescription", { product: displayTitle })}
            </p>
          </div>
          <a
            href={portalUrl}
            className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: btnColor, color: btnFg, borderRadius: btnRadius }}
          >
            {t("checkout.accessContent")}
            <IconArrowRight className="size-4" />
          </a>
          <p className="text-xs" style={{ color: "#999" }}>{t("checkout.checkEmail")}</p>
        </div>
      </div>
    );
  }

  /* ─── Main checkout ─── */
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row" style={{ fontFamily }}>
      {/* ═══ LEFT PANEL — 50% ═══ */}
      <div className="lg:w-1/2 flex justify-end" style={{ background: bgColor }}>
        <div className="w-full max-w-[390px] mx-auto px-6 pt-[50px] pb-8 lg:pb-0 lg:max-w-none lg:w-[470px] lg:mx-0 lg:px-0 lg:pr-[80px] lg:pt-[50px]">
          {/* Tenant avatar + name */}
          <div className="flex items-center gap-3 mb-8">
            {tenantAvatarUrl ? (
              <img src={tenantAvatarUrl} alt={checkout.tenant_name} className="rounded-full object-cover" width={30} height={30} style={{ background: leftIsDark ? "#222" : "#E8E8E8" }} />
            ) : (
              <div className="rounded-full flex items-center justify-center text-xs font-semibold" style={{ width: 30, height: 30, background: leftIsDark ? "#222" : brandColor, color: leftIsDark ? "#F5F5F5" : brandFg }}>
                {checkout.tenant_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[15px] font-medium" style={{ color: leftTextPrimary }}>{checkout.tenant_name}</span>
          </div>

          {/* Product title */}
          <h1 className="text-[22px] font-semibold leading-snug mb-1.5" style={{ color: isUnavailable ? "#AAA" : leftTextPrimary }}>
            {displayTitle}
          </h1>

          {/* Price */}
          <p className="text-[15px] mb-6" style={{ color: isUnavailable ? "#CCC" : leftTextSecondary }}>{priceLabel}</p>

          {/* Cover image — no fetchPriority, let browser decide */}
          {coverImage && (
            <div className="w-full rounded-xl overflow-hidden mb-6" style={{ background: leftIsDark ? "#222" : "#E8E8E8", aspectRatio: "1 / 1", opacity: isUnavailable ? 0.4 : 1 }}>
              <img src={coverImage} alt={displayTitle} className="w-full h-full object-cover" width={800} height={800} decoding="async" />
            </div>
          )}

          {/* Description */}
          {checkout.description && (
            <p className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: isUnavailable ? "#CCC" : leftTextTertiary }}>
              {checkout.description}
            </p>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL — 50% ═══ */}
      <div className="lg:w-1/2 flex justify-start" style={{ background: "#FFFFFF" }}>
        <div className="w-full max-w-[390px] mx-auto px-6 pt-[50px] pb-10 lg:max-w-none lg:w-[470px] lg:mx-0 lg:px-0 lg:pl-[80px] lg:pt-[50px]">
          <h2 className="text-[16px] font-semibold mb-5" style={{ color: "#1A1A1A" }}>{t("checkout.contactInfo")}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="checkout-name" className="block text-[13px] font-medium" style={{ color: "#333" }}>{t("checkout.fullName")}</label>
              <input id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("checkout.namePlaceholder")} required className="w-full h-10 px-3.5 rounded-lg text-[14px] outline-none transition-all" style={inputBaseStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="checkout-email" className="block text-[13px] font-medium" style={{ color: "#333" }}>{t("checkout.email")}</label>
              <input id="checkout-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("checkout.emailPlaceholder")} required className="w-full h-10 px-3.5 rounded-lg text-[14px] outline-none transition-all" style={inputBaseStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Phone */}
            {checkout.collect_phone && (
              <div className="space-y-1.5">
                <label htmlFor="checkout-phone" className="block text-[13px] font-medium" style={{ color: "#333" }}>{t("checkout.phone")}</label>
                <input id="checkout-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("checkout.phonePlaceholder")} className="w-full h-10 px-3.5 rounded-lg text-[14px] outline-none transition-all" style={inputBaseStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            )}

            {/* Address */}
            {checkout.collect_address && (
              <div className="space-y-1.5">
                <label htmlFor="checkout-address" className="block text-[13px] font-medium" style={{ color: "#333" }}>{t("checkout.address")}</label>
                <input id="checkout-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("checkout.addressPlaceholder")} className="w-full h-10 px-3.5 rounded-lg text-[14px] outline-none transition-all" style={inputBaseStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            )}

            {/* CPF/CNPJ */}
            {checkout.collect_fiscal_id && (
              <div className="space-y-1.5">
                <label htmlFor="checkout-fiscal-id" className="block text-[13px] font-medium" style={{ color: "#333" }}>{t("checkout.fiscalId")}</label>
                <input id="checkout-fiscal-id" value={fiscalId} onChange={(e) => setFiscalId(e.target.value)} placeholder={t("checkout.fiscalIdPlaceholder")} className="w-full h-10 px-3.5 rounded-lg text-[14px] outline-none transition-all" style={inputBaseStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            )}

            {/* Discount code */}
            {checkout.allow_discount_codes && (
              <div className="space-y-1.5">
                <label htmlFor="checkout-discount" className="block text-[13px] font-medium" style={{ color: "#333" }}>{t("checkout.discountCode")}</label>
                <div className="flex gap-2">
                  <input id="checkout-discount" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} placeholder={t("checkout.discountPlaceholder")} className="flex-1 h-10 px-3.5 rounded-lg text-[14px] outline-none transition-all" style={inputBaseStyle} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" className="h-10 px-4 rounded-lg text-[13px] font-medium transition-colors" style={{ background: "#F0F0F0", color: "#555", border: "1px solid #E0E0E0" }}>
                    {t("checkout.apply")}
                  </button>
                </div>
              </div>
            )}

            {/* Subtotal / Total */}
            <div className="space-y-2.5 mt-2 pt-4" style={{ borderTop: "1px solid #EBEBEB" }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: "#888" }}>{t("checkout.subtotal")}</span>
                <span className="text-[13px]" style={{ color: "#555" }}>{displayPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold" style={{ color: "#1A1A1A" }}>{t("checkout.total")}</span>
                <span className="text-[16px] font-semibold" style={{ color: "#1A1A1A" }}>{displayPrice}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting || isUnavailable}
                className="w-full h-[52px] text-[15px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: isUnavailable ? "#E0E0E0" : btnColor,
                  color: isUnavailable ? "#999" : btnFg,
                  borderRadius: btnRadius,
                  cursor: isUnavailable ? "not-allowed" : undefined,
                }}
              >
                {submitting ? (
                  <IconSpinner className="size-5 animate-spin" />
                ) : isUnavailable ? (
                  t("checkout.productUnavailable")
                ) : checkout.unit_amount === 0 ? (
                  t("checkout.getFreeAccess")
                ) : (
                  t("checkout.pay", { price: displayPrice })
                )}
              </button>
            </div>

            {/* Terms */}
            <p className="text-[11px] text-center leading-relaxed" style={{ color: "#AAA" }}>
              {t("checkout.termsPrefix")}{" "}
              <span className="underline cursor-pointer" style={{ color: "#888" }}>{t("checkout.termsOfUse")}</span>{" "}
              {t("checkout.and")}{" "}
              <span className="underline cursor-pointer" style={{ color: "#888" }}>{t("checkout.privacyPolicy")}</span>.
            </p>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <IconShield className="size-3.5" style={{ color: "#BBB" }} />
            <span className="text-[11px]" style={{ color: "#BBB" }}>{t("checkout.securePayment")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
