import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBroadcast } from "@/hooks/useBroadcasts";

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "draft":
      return "secondary";
    case "sending":
    case "queued":
      return "outline";
    case "sent":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function AdminBroadcastDetail() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { broadcastId } = useParams<{ broadcastId: string }>();
  const { broadcast, loading } = useBroadcast(broadcastId);

  if (loading) {
    return (
      <>
        <div className="h-full min-w-0 overflow-hidden p-4 sm:p-6 lg:p-10">
          <div className="mx-auto flex h-full min-w-0 max-w-[1200px] 3xl:max-w-[1600px] flex-col gap-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!broadcast) {
    return (
      <>
        <div className="h-full min-w-0 overflow-hidden p-4 sm:p-6 lg:p-10">
          <div className="mx-auto flex min-w-0 max-w-[1200px] 3xl:max-w-[1600px] flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold mb-2">Disparo não encontrado</p>
            <Button variant="outline" onClick={() => navigate("/admin/email/broadcasts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </>
    );
  }

  const resendDashboardUrl = broadcast.resend_broadcast_id
    ? `https://resend.com/broadcasts/${broadcast.resend_broadcast_id}`
    : null;

  return (
    <>
      <div className="h-full min-w-0 overflow-hidden p-4 sm:p-6 lg:p-10">
        <div className="mx-auto flex h-full min-w-0 max-w-[1200px] 3xl:max-w-[1600px] flex-col gap-6">
          {/* Header */}
          <div className="flex min-w-0 shrink-0 flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate("/admin/email/broadcasts")}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <h1 className="min-w-0 truncate text-xl font-semibold tracking-normal text-foreground md:text-2xl flex-1">
                {broadcast.subject || "—"}
              </h1>
              <Badge variant={statusBadgeVariant(broadcast.status)} className="shrink-0">
                {t(`email.broadcast.status.${broadcast.status}`, broadcast.status)}
              </Badge>
            </div>
          </div>

          {/* Info + performance link */}
          <Card variant="bordered">
            <CardContent className="pt-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                {broadcast.sent_at && (
                  <div>
                    <dt className="text-label text-muted-foreground mb-1">
                      {t("email.metrics.sent")}
                    </dt>
                    <dd className="text-sm text-foreground">
                      {formatDateTime(broadcast.sent_at, lang)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-label text-muted-foreground mb-1">
                    {t("email.broadcast.from")}
                  </dt>
                  <dd className="text-sm text-foreground">
                    {broadcast.from_name} &lt;{broadcast.from_email}&gt;
                  </dd>
                </div>
                <div>
                  <dt className="text-label text-muted-foreground mb-1">
                    {t("email.broadcast.audience")}
                  </dt>
                  <dd className="text-sm text-foreground">
                    {t("email.broadcast.recipientCount", { count: broadcast.recipient_count || 0 })}
                  </dd>
                </div>
                {broadcast.error_message && (
                  <div className="sm:col-span-2">
                    <dt className="text-label text-destructive mb-1">Erro</dt>
                    <dd className="text-sm text-destructive">{broadcast.error_message}</dd>
                  </div>
                )}
              </dl>

              {/* Link to Resend dashboard for performance tracking */}
              {resendDashboardUrl && (
                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(resendDashboardUrl, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="size-3.5" />
                    Ver métricas de performance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email preview */}
          {broadcast.html && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="text-base">{t("email.editor.preview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center bg-muted/30 rounded-lg p-4">
                  <iframe
                    srcDoc={broadcast.html}
                    sandbox=""
                    title="Email preview"
                    className="w-[600px] h-[600px] border rounded-md bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
