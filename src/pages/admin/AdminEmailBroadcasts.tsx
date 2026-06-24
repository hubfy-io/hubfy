import { useNavigate } from "react-router-dom";
import { Plus, Mail, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { useBroadcasts, useSubscribedCustomerCount } from "@/hooks/useBroadcasts";
import { useEmailSettings } from "@/hooks/useEmailSettings";
import BroadcastKPICards from "@/components/admin/email/BroadcastKPICards";

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

export default function AdminEmailBroadcasts() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { broadcasts, loading } = useBroadcasts();
  const { settings, loading: settingsLoading } = useEmailSettings();
  const { data: subscribedCount } = useSubscribedCustomerCount();

  const needsSetup = !settingsLoading && (!settings || settings.domain_status !== "verified");

  return (
    <>
      <div className="h-full min-w-0 overflow-hidden p-4 sm:p-6 lg:p-10">
        <div className="mx-auto flex h-full min-w-0 max-w-[1200px] 3xl:max-w-[1600px] flex-col gap-6">
          {/* Page header */}
          <div className="flex min-w-0 shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h1 className="min-w-0 truncate text-xl font-semibold tracking-normal text-foreground md:text-2xl">
                {t("email.title")}
              </h1>
              <Button
                size="sm"
                className="shrink-0 gap-1 px-2.5 text-xs md:h-9 md:gap-2 md:px-4 md:text-sm"
                onClick={() => navigate("/admin/email/broadcasts/new")}
              >
                <Plus className="size-3.5 md:size-4" />
                <span className="hidden md:inline">{t("email.newBroadcast")}</span>
                <span className="md:hidden">Novo</span>
              </Button>
            </div>
          </div>

          {/* Setup banner */}
          {needsSetup && (
            <Card variant="bordered" className="border-warning/50 bg-warning/5">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <p className="text-sm text-muted-foreground flex-1">{t("email.setupRequired")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => navigate("/admin/settings/emails")}
                >
                  {t("email.domain.setup")}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* KPI cards */}
          <BroadcastKPICards
            broadcasts={broadcasts}
            subscribedCount={subscribedCount}
            loading={loading}
          />

          {/* Broadcasts table */}
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : broadcasts.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Mail className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("email.noBroadcasts")}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {t("email.noBroadcastsDesc")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card variant="bordered" className="min-w-0 overflow-hidden">
              <div className="overflow-auto">
                <div className="min-w-[600px]">
                  <Table className="w-full table-fixed text-xs md:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[45%]">
                          {t("email.broadcast.subject")}
                        </TableHead>
                        <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[15%]">
                          Status
                        </TableHead>
                        <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[15%] text-right">
                          {t("email.broadcast.audience")}
                        </TableHead>
                        <TableHead className="h-9 bg-card px-3 text-[10px] font-semibold text-muted-foreground md:h-10 md:px-4 md:text-xs w-[25%]">
                          {t("customers.columns.createdAt")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {broadcasts.map((broadcast) => (
                        <TableRow
                          key={broadcast.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/admin/email/broadcasts/${broadcast.id}`)}
                        >
                          <TableCell className="px-3 md:px-4 font-medium truncate">
                            {broadcast.subject || "—"}
                          </TableCell>
                          <TableCell className="px-3 md:px-4">
                            <Badge variant={statusBadgeVariant(broadcast.status)}>
                              {t(`email.broadcast.status.${broadcast.status}`, broadcast.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 md:px-4 text-right">
                            {broadcast.recipient_count > 0
                              ? broadcast.recipient_count.toLocaleString(lang)
                              : "—"}
                          </TableCell>
                          <TableCell className="px-3 md:px-4 text-muted-foreground">
                            {formatDateTime(broadcast.sent_at ?? broadcast.created_at, lang)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
