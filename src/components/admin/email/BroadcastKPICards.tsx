import { Send, Users, Mail, FileEdit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Broadcast } from "@/hooks/useBroadcasts";

interface Props {
  broadcasts: Broadcast[];
  subscribedCount: number | undefined;
  loading: boolean;
}

export default function BroadcastKPICards({ broadcasts, subscribedCount, loading }: Props) {
  const { t } = useTranslation();

  const sentBroadcasts = broadcasts.filter((b) => b.status === "sent");
  const totalSent = sentBroadcasts.length;
  const totalRecipients = sentBroadcasts.reduce((sum, b) => sum + b.recipient_count, 0);
  const drafts = broadcasts.filter((b) => b.status === "draft").length;

  const stats = [
    {
      label: t("email.kpi.totalSent"),
      value: totalSent.toLocaleString("pt-BR"),
      description: t("email.kpi.totalSentDesc"),
      icon: Send,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: t("email.kpi.totalRecipients"),
      value: totalRecipients.toLocaleString("pt-BR"),
      description: t("email.kpi.totalRecipientsDesc"),
      icon: Mail,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: t("email.kpi.subscribedContacts"),
      value: subscribedCount?.toLocaleString("pt-BR") ?? "0",
      description: t("email.kpi.subscribedContactsDesc"),
      icon: Users,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      label: t("email.kpi.drafts"),
      value: drafts.toLocaleString("pt-BR"),
      description: t("email.kpi.draftsDesc"),
      icon: FileEdit,
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} variant="bordered" size="sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between pb-2 mb-3">
              <span className="text-label uppercase tracking-wide">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`size-4 ${stat.iconColor}`} />
              </div>
            </div>
            {loading ? (
              <>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                <p className="text-support">{stat.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
