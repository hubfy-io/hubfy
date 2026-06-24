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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertTriangle,
  CreditCard,
  ShieldAlert,
  ShieldX,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Clock,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { findGuide } from "@/pages/Guides";

const ns = "guides.articles.disputedVsChargeback";

export default function GuideDisputedVsChargeback() {
  const { t } = useTranslation();
  const guide = findGuide("disputed-vs-chargeback")!;
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

            {/* Disputed section */}
            <section
              id="disputed"
              ref={(ref) => addRef("disputed", ref)}
              className="mt-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <ShieldAlert className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  {t(`${ns}.disputed.title`)}
                  <Badge variant="purple">{t(`${ns}.disputed.badge`)}</Badge>
                </h2>
              </div>

              <p className="text-muted-foreground mb-4">{t(`${ns}.disputed.description`)}</p>

              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(`${ns}.whenItHappens`)}</p>
                    <p className="text-muted-foreground mt-1">{t(`${ns}.disputed.when`)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Eye className="size-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(`${ns}.whatHappens`)}</p>
                    <p className="text-muted-foreground mt-1">{t(`${ns}.disputed.whatHappens`)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(`${ns}.studentAccess`)}</p>
                    <p className="text-muted-foreground mt-1">
                      <span className="text-green-600 dark:text-green-400 font-medium">{t(`${ns}.disputed.access`)}</span>
                      {" — "}{t(`${ns}.disputed.accessDetail`)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <ArrowRight className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(`${ns}.nextSteps`)}</p>
                    <p className="text-muted-foreground mt-1">{t(`${ns}.disputed.nextSteps`)}</p>
                  </div>
                </div>
              </div>

              {/* Flow */}
              <div className="rounded-xl border border-border bg-muted/30 p-5 mt-6">
                <p className="font-medium text-center mb-4">{t(`${ns}.disputed.flowTitle`)}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <Badge variant="green" className="text-sm px-3 py-1.5">{t(`${ns}.statusApproved`)}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <Badge variant="purple" className="text-sm px-3 py-1.5">{t(`${ns}.disputed.badge`)}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="green" className="text-sm px-3 py-1.5">{t(`${ns}.statusApproved`)}</Badge>
                    <span className="text-xs text-muted-foreground">{t(`${ns}.or`)}</span>
                    <Badge variant="red" className="text-sm px-3 py-1.5">{t(`${ns}.chargeback.badge`)}</Badge>
                  </div>
                </div>
              </div>
            </section>

            {/* Chargeback section */}
            <section
              id="chargeback"
              ref={(ref) => addRef("chargeback", ref)}
              className="mt-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10">
                  <ShieldX className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  {t(`${ns}.chargeback.title`)}
                  <Badge variant="red">{t(`${ns}.chargeback.badge`)}</Badge>
                </h2>
              </div>

              <p className="text-muted-foreground mb-4">{t(`${ns}.chargeback.description`)}</p>

              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="size-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(`${ns}.whenItHappens`)}</p>
                    <p className="text-muted-foreground mt-1">{t(`${ns}.chargeback.when`)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <XCircle className="size-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(`${ns}.whatHappens`)}</p>
                    <p className="text-muted-foreground mt-1">{t(`${ns}.chargeback.whatHappens`)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Lock className="size-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(`${ns}.studentAccess`)}</p>
                    <p className="text-muted-foreground mt-1">
                      <span className="text-red-600 dark:text-red-400 font-medium">{t(`${ns}.chargeback.access`)}</span>
                      {" — "}{t(`${ns}.chargeback.accessDetail`)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Comparison table */}
            <section
              id="comparison"
              ref={(ref) => addRef("comparison", ref)}
              className="mt-12"
            >
              <h2 className="text-2xl font-semibold mb-6">{t(`${ns}.comparisonTitle`)}</h2>

              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[160px]">{t(`${ns}.table.criteria`)}</TableHead>
                      <TableHead><Badge variant="purple">{t(`${ns}.disputed.badge`)}</Badge></TableHead>
                      <TableHead><Badge variant="red">{t(`${ns}.chargeback.badge`)}</Badge></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t(`${ns}.table.meaning`)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-normal">{t(`${ns}.table.disputedMeaning`)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-normal">{t(`${ns}.table.chargebackMeaning`)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t(`${ns}.table.accessLabel`)}</TableCell>
                      <TableCell className="text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">{t(`${ns}.table.accessMaintained`)}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="text-red-600 dark:text-red-400 font-medium">{t(`${ns}.table.accessRevoked`)}</span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t(`${ns}.table.reversible`)}</TableCell>
                      <TableCell className="text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">{t(`${ns}.table.yes`)}</span>
                        {" "}<span className="text-muted-foreground">({t(`${ns}.table.canResolve`)})</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="text-red-600 dark:text-red-400 font-medium">{t(`${ns}.table.no`)}</span>
                        {" "}<span className="text-muted-foreground">({t(`${ns}.table.terminal`)})</span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t(`${ns}.table.systemBehavior`)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-normal">{t(`${ns}.table.disputedBehavior`)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-normal">{t(`${ns}.table.chargebackBehavior`)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* TL;DR */}
            <section
              id="tldr"
              ref={(ref) => addRef("tldr", ref)}
              className="mt-12 mb-8"
            >
              <h2 className="text-2xl font-semibold mb-6">{t(`${ns}.tldrTitle`)}</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <div className="flex-1 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-4 text-purple-600 dark:text-purple-400" />
                    <Badge variant="purple">{t(`${ns}.disputed.badge`)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t(`${ns}.tldrDisputed`)}</p>
                </div>
                <div className="flex-1 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="size-4 text-red-600 dark:text-red-400" />
                    <Badge variant="red">{t(`${ns}.chargeback.badge`)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t(`${ns}.tldrChargeback`)}</p>
                </div>
              </div>
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

export { GuideDisputedVsChargeback };
