import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { contrastColor, inputBaseStyle } from "@/lib/checkout-utils";
import { WorkspaceAvatar } from "@/components/admin/WorkspaceAvatar";

const PREVIEW_COVER = "/images/portal-backgrounds/creatopy-BrDJ-OauGxQ-unsplash.webp";

interface DesignPreviewProps {
  iconUrl: string | null;
  iconName?: string | null;
  iconColor?: string | null;
  brandColor: string;
  themeMode: "light" | "dark";
  tenantName: string;
  previewMode?: "desktop" | "mobile";
  checkoutBgColor?: string;
  checkoutButtonStyle?: string;
}

const BUTTON_RADIUS: Record<string, string> = {
  rounded: "8px",
  rectangular: "2px",
  pill: "9999px",
};

export default function DesignPreview({
  iconUrl,
  iconName,
  iconColor,
  brandColor,
  themeMode,
  tenantName,
  previewMode = "desktop",
  checkoutBgColor,
  checkoutButtonStyle = "pill",
}: DesignPreviewProps) {
  const { t } = useTranslation();
  const brandFg = contrastColor(brandColor);
  const isDark = themeMode === "dark";

  // Left panel: when custom bg is provided, auto-detect if it's dark/light
  const leftBg = isDark ? "#0A0A0A" : "#F9F9F9";
  const leftIsDark = checkoutBgColor
    ? contrastColor(checkoutBgColor) === "#FFFFFF"
    : isDark;
  const leftTextPrimary = leftIsDark ? "#F5F5F5" : "#1A1A1A";
  const leftTextSecondary = leftIsDark ? "#A0A0A0" : "#666";
  const leftTextTertiary = leftIsDark ? "#777" : "#555";
  const avatarBg = leftIsDark ? "#222" : "#E8E8E8";

  const isMobile = previewMode === "mobile";

  return (
    <div
      className={isMobile ? "flex flex-col h-full" : "flex flex-row h-full"}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      {/* ═══ LEFT PANEL (themed / custom bg) ═══ */}
      <div
        className={isMobile ? "flex justify-center items-start" : "w-1/2 flex justify-center items-start"}
        style={{ background: checkoutBgColor || leftBg }}
      >
        <div className={isMobile ? "w-full pt-6 pb-4 px-4" : "w-full max-w-[280px] pt-[48px] pb-6 px-4"}>
          {/* Tenant avatar + name */}
          <div className="flex items-center gap-2 mb-5">
            <WorkspaceAvatar
              iconUrl={iconUrl}
              iconName={iconName}
              iconColor={iconColor}
              size="sm"
              className="rounded-full shrink-0"
            />
            <span className="text-[11px] font-medium" style={{ color: leftTextPrimary }}>
              {tenantName || t("designPage.preview.yourCompany")}
            </span>
          </div>

          {/* Product title (fictitious) */}
          <h1
            className="text-[15px] font-semibold leading-snug mb-0.5"
            style={{ color: leftTextPrimary }}
          >
            {t("designPage.preview.productName")}
          </h1>

          {/* Price */}
          <p className="text-[11px] mb-4" style={{ color: leftTextSecondary }}>
            {t("designPage.preview.productPrice")}
          </p>

          {/* Cover image (static) */}
          <div className="w-full aspect-video rounded-md overflow-hidden mb-4">
            <img
              src={PREVIEW_COVER}
              alt={t("designPage.preview.productCover")}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description (fictitious) */}
          <p
            className="text-[10px] leading-relaxed"
            style={{ color: leftTextTertiary }}
          >
            {t("designPage.preview.productDescription")}
          </p>
        </div>
      </div>

      {/* ═══ RIGHT PANEL (always white) ═══ */}
      <div
        className={isMobile ? "flex justify-center items-start" : "w-1/2 flex justify-center items-start"}
        style={{ background: "#FFFFFF" }}
      >
        <div className={isMobile ? "w-full pt-4 pb-6 px-4" : "w-full max-w-[280px] pt-[48px] pb-6 px-4"}>
          <h2 className="text-[12px] font-semibold mb-3" style={{ color: "#1A1A1A" }}>
            {t("designPage.preview.contactInfo")}
          </h2>

          <div className="space-y-2.5">
            {/* Name */}
            <div className="space-y-0.5">
              <label className="block text-[9px] font-medium" style={{ color: "#555" }}>
                {t("designPage.preview.fullName")}
              </label>
              <div
                className="w-full h-7 px-2.5 rounded-md text-[10px] flex items-center"
                style={{ ...inputBaseStyle, color: "#999" }}
              >
                {t("designPage.preview.namePlaceholder")}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-0.5">
              <label className="block text-[9px] font-medium" style={{ color: "#555" }}>
                {t("designPage.preview.email")}
              </label>
              <div
                className="w-full h-7 px-2.5 rounded-md text-[10px] flex items-center"
                style={{ ...inputBaseStyle, color: "#999" }}
              >
                {t("designPage.preview.emailPlaceholder")}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-0.5">
              <label className="block text-[9px] font-medium" style={{ color: "#555" }}>
                {t("designPage.preview.phone")}
              </label>
              <div
                className="w-full h-7 px-2.5 rounded-md text-[10px] flex items-center"
                style={{ ...inputBaseStyle, color: "#999" }}
              >
                {t("designPage.preview.phonePlaceholder")}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 pt-2.5" style={{ borderTop: "1px solid #EBEBEB" }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px]" style={{ color: "#888" }}>
                  {t("designPage.preview.subtotal")}
                </span>
                <span className="text-[9px]" style={{ color: "#555" }}>
                  {t("designPage.preview.previewPrice")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold" style={{ color: "#1A1A1A" }}>
                  {t("designPage.preview.total")}
                </span>
                <span className="text-[12px] font-semibold" style={{ color: "#1A1A1A" }}>
                  {t("designPage.preview.previewPrice")}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-0.5">
              <div
                className="w-full h-[36px] text-[11px] font-semibold flex items-center justify-center"
                style={{
                  background: brandColor,
                  color: brandFg,
                  borderRadius: BUTTON_RADIUS[checkoutButtonStyle] || BUTTON_RADIUS.pill,
                }}
              >
                {t("designPage.preview.payButton")}
              </div>
            </div>

            {/* Terms */}
            <p className="text-[8px] text-center leading-relaxed" style={{ color: "#AAA" }}>
              {t("designPage.preview.terms")}{" "}
              <span className="underline" style={{ color: "#888" }}>
                {t("designPage.preview.termsOfUse")}
              </span>{" "}
              {t("designPage.preview.and")}{" "}
              <span className="underline" style={{ color: "#888" }}>
                {t("designPage.preview.privacyPolicy")}
              </span>
              .
            </p>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <ShieldCheck className="size-2.5" style={{ color: "#BBB" }} />
            <span className="text-[8px]" style={{ color: "#BBB" }}>
              {t("designPage.preview.securePayment")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
