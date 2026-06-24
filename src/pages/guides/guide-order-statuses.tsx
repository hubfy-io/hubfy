import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Clock,
  CheckCircle,
  PackageCheck,
  RotateCcw,
  XCircle,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  ArrowUp,
  Home,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { findGuide } from "@/pages/Guides";

const ns = "guides.articles.orderStatuses";

const ORDER_STATUSES = [
  { key: "pending", variant: "amber" as const, icon: Clock, accessKey: "accessMaintained" },
  { key: "approved", variant: "green" as const, icon: CheckCircle, accessKey: "accessGranted" },
  { key: "completed", variant: "blue" as const, icon: PackageCheck, accessKey: "accessMaintained" },
  { key: "refunded", variant: "gray" as const, icon: RotateCcw, accessKey: "accessRevoked" },
  { key: "cancelled", variant: "red" as const, icon: XCircle, accessKey: "accessRevoked" },
  { key: "disputed", variant: "purple" as const, icon: AlertTriangle, accessKey: "accessMaintained" },
  { key: "chargeback", variant: "red" as const, icon: CreditCard, accessKey: "accessRevoked" },
];

const MOCK_ORDERS = [
  { id: "#1042", customer: "Maria Silva", product: "Curso de Marketing Digital", amount: "R$ 297,00", status: "approved" as const, variant: "green" as const },
  { id: "#1041", customer: "João Santos", product: "Pack de Templates PRO", amount: "R$ 147,00", status: "pending" as const, variant: "amber" as const },
  { id: "#1040", customer: "Ana Oliveira", product: "Mentoria Individual", amount: "R$ 997,00", status: "completed" as const, variant: "blue" as const },
  { id: "#1039", customer: "Carlos Lima", product: "Curso de Marketing Digital", amount: "R$ 297,00", status: "refunded" as const, variant: "gray" as const },
  { id: "#1038", customer: "Fernanda Costa", product: "Pack de Templates PRO", amount: "R$ 147,00", status: "cancelled" as const, variant: "red" as const },
];

export default function GuideOrderStatuses() {
  const { t } = useTranslation();
  const guide = findGuide("order-statuses")!;
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    const sections = Object.keys(sectionRefs.current);
    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.3 }
    );
    sections.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer?.observe(el);
    });
    return () => { observer?.disconnect(); observer = null; };
  }, []);

  const addRef = (id: string, ref: HTMLElement | null) => {
    if (ref) sectionRefs.current[id] = ref;
  };

  return (
    <section className="py-8 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/guides"><Home className="size-4" /></Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/guides">{t("guides.categories.orders")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t(`${ns}.title`)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <h1 className="mt-7 mb-4 max-w-3xl text-2xl font-semibold md:text-4xl">
          {t(`${ns}.title`)}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{t("guides.categories.orders")}</Badge>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {guide.readTime} min
          </span>
        </div>

        <Separator className="mt-8 mb-12" />

        {/* Grid: content + sidebar */}
        <div className="relative grid grid-cols-12 gap-6">
          {/* Main content */}
          <div className="col-span-12 lg:col-span-8">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground">{t(`${ns}.intro`)}</p>
            </div>

            {/* Each status */}
            <section
              id="each-status"
              ref={(ref) => addRef("each-status", ref)}
              className="mt-10"
            >
              <h2 className="text-2xl font-semibold mb-6">{t(`${ns}.eachStatusTitle`)}</h2>

              <div className="space-y-5">
                {ORDER_STATUSES.map(({ key, variant, icon: Icon, accessKey }) => (
                  <div key={key} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <Badge variant={variant} className="text-sm px-3 py-1">
                        {t(`${ns}.statuses.${key}.label`)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{t(`${ns}.statuses.${key}.description`)}</p>
                    <div className="flex flex-col gap-1.5 mt-3">
                      <div className="flex items-start gap-2 text-sm">
                        <span className="shrink-0 font-medium text-foreground">{t(`${ns}.whenItHappens`)}:</span>
                        <span className="text-muted-foreground">{t(`${ns}.statuses.${key}.when`)}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="shrink-0 font-medium text-foreground">{t(`${ns}.studentAccess`)}:</span>
                        <span className="text-muted-foreground">{t(`${ns}.${accessKey}`)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Summary table */}
            <section
              id="summary-table"
              ref={(ref) => addRef("summary-table", ref)}
              className="mt-12"
            >
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.summaryTableTitle`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.summaryTableIntro`)}</p>

              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t(`${ns}.table.status`)}</TableHead>
                      <TableHead>{t(`${ns}.table.meaning`)}</TableHead>
                      <TableHead>{t(`${ns}.table.access`)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ORDER_STATUSES.map(({ key, variant, accessKey }) => (
                      <TableRow key={key}>
                        <TableCell>
                          <Badge variant={variant}>{t(`${ns}.statuses.${key}.label`)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-normal max-w-xs">
                          {t(`${ns}.statuses.${key}.shortMeaning`)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {accessKey === "accessGranted" && (
                            <span className="text-green-600 dark:text-green-400 font-medium">{t(`${ns}.accessGranted`)}</span>
                          )}
                          {accessKey === "accessMaintained" && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">{t(`${ns}.accessMaintained`)}</span>
                          )}
                          {accessKey === "accessRevoked" && (
                            <span className="text-red-600 dark:text-red-400 font-medium">{t(`${ns}.accessRevoked`)}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Flow */}
            <section
              id="flow"
              ref={(ref) => addRef("flow", ref)}
              className="mt-12"
            >
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.flowTitle`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.flowIntro`)}</p>

              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <Badge variant="amber" className="text-sm px-3 py-1.5">{t(`${ns}.statuses.pending.label`)}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <Badge variant="green" className="text-sm px-3 py-1.5">{t(`${ns}.statuses.approved.label`)}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <Badge variant="blue" className="text-sm px-3 py-1.5">{t(`${ns}.statuses.completed.label`)}</Badge>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">{t(`${ns}.flowHappyPath`)}</p>
              </div>

              <Alert className="mt-6">
                <Lightbulb className="size-4" />
                <AlertTitle>{t("guides.tip", "Dica")}</AlertTitle>
                <AlertDescription>
                  {t(`${ns}.flowTip`, "Pedidos com status Disputada ou Chargeback seguem um caminho diferente. Veja o guia específico para entender cada cenário.")}
                </AlertDescription>
              </Alert>
            </section>

            {/* Mockup */}
            <section
              id="mockup"
              ref={(ref) => addRef("mockup", ref)}
              className="mt-12 mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.mockupTitle`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.mockupIntro`)}</p>

              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t(`${ns}.mockup.order`)}</TableHead>
                      <TableHead>{t(`${ns}.mockup.customer`)}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t(`${ns}.mockup.product`)}</TableHead>
                      <TableHead className="text-right">{t(`${ns}.mockup.amount`)}</TableHead>
                      <TableHead>{t(`${ns}.table.status`)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ORDERS.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                        <TableCell className="text-sm">{order.customer}</TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{order.product}</TableCell>
                        <TableCell className="text-sm text-right tabular-nums">{order.amount}</TableCell>
                        <TableCell>
                          <Badge variant={order.variant}>{t(`${ns}.statuses.${order.status}.label`)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">{t(`${ns}.mockupCaption`)}</p>
            </section>
          </div>

          {/* Sidebar TOC (desktop) */}
          <div className="sticky top-24 col-span-3 col-start-10 hidden h-fit lg:block">
            <span className="text-lg font-medium">{t("guides.onThisPage", "Nesta página")}</span>
            <nav className="mt-4 text-sm">
              <ul className="space-y-1">
                {guide.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        "block py-1 transition-colors duration-200",
                        activeSection === s.id
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      {t(s.titleKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Separator className="my-6" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp className="size-3.5" />
              {t("guides.backToTop", "Voltar ao topo")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export { GuideOrderStatuses };
