import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ColorPalette from "./ColorPalette";

export interface DesignCheckoutFormData {
  checkout_use_brand_colors: boolean;
  checkout_bg_color: string;
}

interface DesignCheckoutTabProps {
  formData: DesignCheckoutFormData;
  themeMode: "light" | "dark";
  onChange: (data: Partial<DesignCheckoutFormData>) => void;
}

export default function DesignCheckoutTab({
  formData,
  themeMode,
  onChange,
}: DesignCheckoutTabProps) {
  const { t } = useTranslation();
  const useBrand = formData.checkout_use_brand_colors;

  const themeBg = themeMode === "dark" ? "#0A0A0A" : "#F9F9F9";
  const effectiveBg = useBrand ? themeBg : formData.checkout_bg_color;

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{t("designPage.checkout.title")}</CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium">{t("common.soon")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Use brand style switch */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t("designPage.checkout.useBrandLabel")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("designPage.checkout.useBrandDescription")}
              </p>
            </div>
            <Switch
              checked={useBrand}
              onCheckedChange={(checked) =>
                onChange({ checkout_use_brand_colors: checked })
              }
            />
          </div>

          <div className="border-t border-border" />

          {/* Background color (left panel) */}
          <div className="space-y-3">
            <div>
              <Label>{t("designPage.checkout.bgLabel")}</Label>
            </div>
            <ColorPalette
              value={effectiveBg}
              onChange={(color) => onChange({ checkout_bg_color: color })}
              disabled={useBrand}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
