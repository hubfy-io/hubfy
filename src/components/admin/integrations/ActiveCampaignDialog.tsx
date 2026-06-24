import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, KeyRound, RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSimpleIntegration } from "@/hooks/useSimpleIntegration";
import { PROVIDERS } from "@/lib/integration-registry";
import { NO_AUTOFILL_PROPS } from "@/lib/no-autofill";

interface ActiveCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const acDef = PROVIDERS.activecampaign;

export function ActiveCampaignDialog({ open, onOpenChange }: ActiveCampaignDialogProps) {
  const { t } = useTranslation();

  const {
    integration,
    isConnected,
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
  } = useSimpleIntegration("activecampaign", {
    connectFnName: "activecampaign-connect",
    disconnectFnName: "activecampaign-disconnect",
    successMessage: t("integrations.activecampaign.connected"),
    disconnectSuccessMessage: t("integrations.activecampaign.disconnected"),
  });

  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const hint = integration?.credentials_hint as Record<string, string> | null;
  const maskedUrl = hint?.api_url ?? "••••";
  const maskedKey = hint?.api_key ?? "••••";

  async function handleConnect() {
    if (!apiUrl.trim() || !apiKey.trim()) return;
    try {
      await connect({ api_url: apiUrl.trim(), api_key: apiKey.trim() });
      setApiUrl("");
      setApiKey("");
      setIsEditing(false);
    } catch {
      // toast handled by hook
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect();
      setConfirmDisconnect(false);
      onOpenChange(false);
    } catch {
      // toast handled by hook
    }
  }

  function handleClose(value: boolean) {
    if (!value) {
      setApiUrl("");
      setApiKey("");
      setIsEditing(false);
      setConfirmDisconnect(false);
    }
    onOpenChange(value);
  }

  const canSubmit = apiUrl.trim().length > 0 && apiKey.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src={acDef.logo}
              alt={acDef.displayName}
              className="h-6 w-6 shrink-0 rounded"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <DialogTitle className="flex items-center gap-2">
              {acDef.displayName}
              {isConnected && (
                <Badge variant="success" className="text-xs font-normal">
                  {t("integrations.card.connected")}
                </Badge>
              )}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isConnected
              ? t("integrations.activecampaign.manageDescription")
              : t("integrations.activecampaign.connectDescription")}
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          /* ── Connect form ── */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("integrations.activecampaign.apiUrlLabel")}
              </label>
              <Input
                {...NO_AUTOFILL_PROPS}
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder={acDef.placeholders?.api_url ?? ""}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {t("integrations.activecampaign.apiUrlHint")}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <Input
                {...NO_AUTOFILL_PROPS}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={acDef.placeholders?.api_key ?? ""}
                onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) handleConnect(); }}
              />
              <p className="text-xs text-muted-foreground">
                {t("integrations.activecampaign.apiKeyHint")}{" "}
                <a
                  href={acDef.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Settings → Developer
                </a>
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting || !canSubmit}
              className="w-full"
            >
              {isConnecting && <Loader2 className="size-4 animate-spin" />}
              {t("integrations.activecampaign.connect")}
            </Button>
          </div>

        ) : !confirmDisconnect ? (
          /* ── Connected: show hints + change/disconnect ── */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <KeyRound className="size-3.5" />
                {t("integrations.activecampaign.credentials")}
              </label>

              {!isEditing ? (
                <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">API URL</p>
                      <code className="text-xs text-foreground truncate block">{maskedUrl}</code>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">API Key</p>
                      <code className="text-xs text-foreground">{maskedKey}</code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setApiUrl("");
                        setApiKey("");
                        setIsEditing(true);
                      }}
                    >
                      <RefreshCw className="size-3.5" />
                      {t("integrations.activecampaign.changeCredentials")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
                  <Input
                    {...NO_AUTOFILL_PROPS}
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder={acDef.placeholders?.api_url ?? ""}
                    autoFocus
                  />
                  <Input
                    {...NO_AUTOFILL_PROPS}
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={acDef.placeholders?.api_key ?? ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canSubmit) handleConnect();
                      if (e.key === "Escape") {
                        setApiUrl("");
                        setApiKey("");
                        setIsEditing(false);
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setApiUrl("");
                        setApiKey("");
                        setIsEditing(false);
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      disabled={isConnecting || !canSubmit}
                    >
                      {isConnecting && <Loader2 className="size-3.5 animate-spin" />}
                      {t("integrations.activecampaign.saveCredentials")}
                    </Button>
                  </div>
                </div>
              )}

              {integration?.last_validated_at && (
                <p className="text-xs text-muted-foreground">
                  {t("integrations.activecampaign.lastValidated")}{" "}
                  {new Date(integration.last_validated_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDisconnect(true)}
              >
                <Unplug className="size-3.5" />
                {t("integrations.activecampaign.disconnect")}
              </Button>
            </div>
          </div>

        ) : (
          /* ── Confirm disconnect ── */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("integrations.activecampaign.disconnectConfirm")}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDisconnect(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting && <Loader2 className="size-3.5 animate-spin" />}
                {t("integrations.activecampaign.confirmDisconnect")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
