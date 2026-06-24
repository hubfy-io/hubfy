import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import {
  formatCurrency,
  contrastColor,
  getPriceLabel,
  buttonRadius,
} from "@/lib/checkout-utils";

export interface CheckoutPreviewProps {
  productName: string;
  unitAmount: number;
  currency: string;
  priceCategory?: string | null;
  title: string;
  description: string;
  coverUrl: string;
  productCoverUrl?: string | null;
  collectPhone: boolean;
  collectAddress: boolean;
  collectFiscalId: boolean;
  allowDiscountCodes: boolean;
  tenantName: string;
  tenantIconUrl: string | null;
  brandColor: string;
  bgColor?: string;
  buttonColor?: string;
  buttonStyle?: string;
  fontFamily?: string;
  previewMode?: "desktop" | "mobile";
}

export default function CheckoutPreview({
  productName,
  unitAmount,
  currency,
  priceCategory,
  title,
  description,
  coverUrl,
  productCoverUrl,
  collectPhone,
  collectAddress,
  collectFiscalId,
  allowDiscountCodes,
  tenantName,
  tenantIconUrl,
  brandColor,
  bgColor,
  buttonColor,
  buttonStyle,
  fontFamily,
  previewMode = "desktop",
}: CheckoutPreviewProps) {
  const { t } = useTranslation();
  const effectiveBg = bgColor || "#F9F9F9";
  const effectiveBtn = buttonColor || brandColor;
  const effectiveBtnFg = contrastColor(effectiveBtn);
  const effectiveRadius = buttonRadius(buttonStyle);
  const effectiveFont = fontFamily || "Geist";
  const brandFg = contrastColor(brandColor);
  const displayTitle = title || productName || "Nome do produto";
  const priceLabel = getPriceLabel({
    unit_amount: unitAmount,
    currency,
    price_category: priceCategory,
  });
  const displayPrice =
    unitAmount === 0 ? "Grátis" : formatCurrency(unitAmount, currency);
  const coverImage = coverUrl || productCoverUrl || null;

  const isMobile = previewMode === "mobile";

  // ─── Derive dark/light palette from left panel background ───
  const leftIsDark = contrastColor(effectiveBg) === "#FFFFFF";

  // Left panel text colors
  const leftTextPrimary = leftIsDark ? "#F5F5F5" : "#1A1A1A";
  const leftTextSecondary = leftIsDark ? "#A0A0A0" : "#666";
  const leftTextTertiary = leftIsDark ? "#888" : "#555";
  const leftImageBg = leftIsDark ? "#1E1E1E" : "#E8E8E8";

  // Right panel: always white background with light-theme colors
  const inputStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #E0E0E0",
    color: "#999",
  };

  return (
    <div
      className={isMobile ? "flex flex-col h-full" : "flex flex-row h-full"}
      style={{ fontFamily: `${effectiveFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` }}
    >
      {/* ═══ LEFT PANEL ═══ */}
      <div
        className={isMobile ? "flex justify-center" : "w-1/2 flex justify-end"}
        style={{ background: effectiveBg }}
      >
        <div
          className={
            isMobile
              ? "w-full px-5 pt-6 pb-4"
              : "w-full max-w-none w-[400px] mx-0 px-0 pr-[80px] pl-[40px] pt-[40px]"
          }
        >
          {/* Tenant avatar + name */}
          <div className="flex items-center gap-2.5 mb-6">
            {tenantIconUrl ? (
              <img
                src={tenantIconUrl}
                alt={tenantName}
                className="rounded-full object-cover"
                style={{ width: 26, height: 26, background: leftImageBg }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center text-[10px] font-semibold"
                style={{ width: 26, height: 26, background: brandColor, color: brandFg }}
              >
                {tenantName?.charAt(0).toUpperCase() || "S"}
              </div>
            )}
            <span className="text-[13px] font-medium" style={{ color: leftTextPrimary }}>
              {tenantName || "Sua empresa"}
            </span>
          </div>

          {/* Product title */}
          <h1
            className="text-[18px] font-semibold leading-snug mb-1"
            style={{ color: leftTextPrimary }}
          >
            {displayTitle}
          </h1>

          {/* Price */}
          <p className="text-[13px] mb-5" style={{ color: leftTextSecondary }}>
            {priceLabel}
          </p>

          {/* Cover image */}
          {coverImage && (
            <div
              className="w-full rounded-lg overflow-hidden mb-5"
              style={{ background: leftImageBg }}
            >
              <img src={coverImage} alt={displayTitle} className="w-full h-auto object-cover" />
            </div>
          )}

          {/* Description */}
          {description && (
            <p
              className="text-[12px] leading-relaxed whitespace-pre-line"
              style={{ color: leftTextTertiary }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div
        className={isMobile ? "flex justify-center" : "w-1/2 flex justify-start"}
        style={{ background: "#FFFFFF" }}
      >
        <div
          className={
            isMobile
              ? "w-full px-5 pt-6 pb-6"
              : "w-full max-w-none w-[400px] mx-0 px-0 pl-[80px] pr-[40px] pt-[40px]"
          }
        >
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>
            {t("checkout.contactInfo")}
          </h2>

          <div className="space-y-3">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium" style={{ color: "#333" }}>
                {t("checkout.fullName")}
              </label>
              <div
                className="w-full h-9 px-3 rounded-lg text-[12px] flex items-center"
                style={inputStyle}
              >
                Maria Silva
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium" style={{ color: "#333" }}>
                {t("checkout.email")}
              </label>
              <div
                className="w-full h-9 px-3 rounded-lg text-[12px] flex items-center"
                style={inputStyle}
              >
                maria@exemplo.com
              </div>
            </div>

            {/* Phone */}
            {collectPhone && (
              <div className="space-y-1">
                <label className="block text-[11px] font-medium" style={{ color: "#333" }}>
                  {t("checkout.phone")}
                </label>
                <div
                  className="w-full h-9 px-3 rounded-lg text-[12px] flex items-center"
                  style={inputStyle}
                >
                  (11) 99999-9999
                </div>
              </div>
            )}

            {/* Address */}
            {collectAddress && (
              <div className="space-y-1">
                <label className="block text-[11px] font-medium" style={{ color: "#333" }}>
                  {t("checkout.address")}
                </label>
                <div
                  className="w-full h-9 px-3 rounded-lg text-[12px] flex items-center"
                  style={inputStyle}
                >
                  Rua exemplo, 123, São Paulo
                </div>
              </div>
            )}

            {/* CPF/CNPJ */}
            {collectFiscalId && (
              <div className="space-y-1">
                <label className="block text-[11px] font-medium" style={{ color: "#333" }}>
                  {t("checkout.fiscalId")}
                </label>
                <div
                  className="w-full h-9 px-3 rounded-lg text-[12px] flex items-center"
                  style={inputStyle}
                >
                  000.000.000-00
                </div>
              </div>
            )}

            {/* Discount code */}
            {allowDiscountCodes && (
              <div className="space-y-1">
                <label className="block text-[11px] font-medium" style={{ color: "#333" }}>
                  {t("checkout.discountCode")}
                </label>
                <div className="flex gap-2">
                  <div
                    className="flex-1 h-9 px-3 rounded-lg text-[12px] flex items-center"
                    style={inputStyle}
                  >
                    {t("checkout.discountPlaceholder")}
                  </div>
                  <div
                    className="h-9 px-3 rounded-lg text-[11px] font-medium flex items-center"
                    style={{
                      background: "#F0F0F0",
                      color: "#555",
                      border: "1px solid #E0E0E0",
                    }}
                  >
                    {t("checkout.apply")}
                  </div>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 pt-3" style={{ borderTop: "1px solid #EBEBEB" }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "#888" }}>
                  {t("checkout.subtotal")}
                </span>
                <span className="text-[11px]" style={{ color: "#555" }}>
                  {displayPrice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold" style={{ color: "#1A1A1A" }}>
                  {t("checkout.total")}
                </span>
                <span className="text-[14px] font-semibold" style={{ color: "#1A1A1A" }}>
                  {displayPrice}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <div
                className="w-full h-[44px] text-[13px] font-semibold flex items-center justify-center"
                style={{ background: effectiveBtn, color: effectiveBtnFg, borderRadius: effectiveRadius }}
              >
                {unitAmount === 0 ? t("checkout.getFreeAccess") : t("checkout.pay", { price: displayPrice })}
              </div>
            </div>

            {/* Terms */}
            <p className="text-[9px] text-center leading-relaxed" style={{ color: "#AAA" }}>
              {t("checkout.termsPrefix")}{" "}
              <span className="underline" style={{ color: "#888" }}>
                {t("checkout.termsOfUse")}
              </span>{" "}
              {t("checkout.and")}{" "}
              <span className="underline" style={{ color: "#888" }}>
                {t("checkout.privacyPolicy")}
              </span>
              .
            </p>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <ShieldCheck className="size-3" style={{ color: "#BBB" }} />
            <span className="text-[9px]" style={{ color: "#BBB" }}>
              {t("checkout.securePayment")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
