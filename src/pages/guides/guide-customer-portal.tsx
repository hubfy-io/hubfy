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
  House,
  User,
  Receipt,
  ShoppingBag,
  ArrowUp,
  Clock,
  Home,
  Lightbulb,
  Mail,
  LogIn,
  Download,
  PlayCircle,
  FileText,
  Check,
  ExternalLink,
  Lock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { findGuide } from "@/pages/Guides";

const ns = "guides.articles.customerPortal";

/* ─── Mock data ─── */

const MOCK_NAV_ITEMS = [
  { icon: House, labelKey: "home", active: true },
  { icon: User, labelKey: "profile", active: false },
  { icon: Receipt, labelKey: "orders", active: false },
  { icon: ShoppingBag, labelKey: "products", active: false },
];

const MOCK_PRODUCTS = [
  { name: "Curso de Marketing Digital", type: "course", progress: 65, hasAccess: true },
  { name: "Pack de Templates PRO", type: "files", progress: null, hasAccess: true },
  { name: "Mentoria Individual", type: "course", progress: 20, hasAccess: true },
  { name: "Curso de Copywriting", type: "course", progress: null, hasAccess: false },
];

const MOCK_ORDERS = [
  { product: "Curso de Marketing Digital", amount: "R$ 297,00", status: "approved" as const, variant: "green" as const, date: "15/03/2026" },
  { product: "Pack de Templates PRO", amount: "R$ 147,00", status: "completed" as const, variant: "blue" as const, date: "10/03/2026" },
  { product: "Mentoria Individual", amount: "R$ 997,00", status: "pending" as const, variant: "amber" as const, date: "01/03/2026" },
];

const MOCK_FILES = [
  { name: "template-instagram-stories.zip", size: "12.4 MB" },
  { name: "guia-marketing-digital.pdf", size: "3.2 MB" },
  { name: "planilha-metricas.xlsx", size: "1.8 MB" },
];

const MOCK_LESSONS = [
  { title: "Introdução ao Marketing Digital", duration: "12:30", completed: true },
  { title: "Definindo seu público-alvo", duration: "18:45", completed: true },
  { title: "Estratégias de conteúdo", duration: "22:10", completed: false },
  { title: "Métricas e análise", duration: "15:20", completed: false },
];

export default function GuideCustomerPortal() {
  const { t } = useTranslation();
  const guide = findGuide("customer-portal")!;
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
                <Link to="/guides">{t("guides.categories.portal")}</Link>
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
          <Badge variant="secondary">{t("guides.categories.portal")}</Badge>
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

            {/* What is the portal */}
            <section id="what-is" ref={(ref) => addRef("what-is", ref)} className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.whatIs.title`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.whatIs.description`)}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: ShoppingBag, titleKey: "whatIs.feature1Title", descKey: "whatIs.feature1Desc" },
                  { icon: PlayCircle, titleKey: "whatIs.feature2Title", descKey: "whatIs.feature2Desc" },
                  { icon: Download, titleKey: "whatIs.feature3Title", descKey: "whatIs.feature3Desc" },
                  { icon: User, titleKey: "whatIs.feature4Title", descKey: "whatIs.feature4Desc" },
                ].map(({ icon: Icon, titleKey, descKey }) => (
                  <div key={titleKey} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground text-sm">{t(`${ns}.${titleKey}`)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t(`${ns}.${descKey}`)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* How to access */}
            <section id="how-to-access" ref={(ref) => addRef("how-to-access", ref)} className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.howToAccess.title`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.howToAccess.description`)}</p>

              <div className="space-y-4">
                {[
                  { step: 1, icon: ExternalLink, titleKey: "howToAccess.step1Title", descKey: "howToAccess.step1Desc" },
                  { step: 2, icon: Mail, titleKey: "howToAccess.step2Title", descKey: "howToAccess.step2Desc" },
                  { step: 3, icon: LogIn, titleKey: "howToAccess.step3Title", descKey: "howToAccess.step3Desc" },
                  { step: 4, icon: Eye, titleKey: "howToAccess.step4Title", descKey: "howToAccess.step4Desc" },
                ].map(({ step, icon: Icon, titleKey, descKey }) => (
                  <div key={step} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{t(`${ns}.${titleKey}`)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t(`${ns}.${descKey}`)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <Lightbulb className="size-4" />
                <AlertTitle>{t("guides.tip")}</AlertTitle>
                <AlertDescription>{t(`${ns}.howToAccess.tip`)}</AlertDescription>
              </Alert>
            </section>

            {/* Portal navigation */}
            <section id="navigation" ref={(ref) => addRef("navigation", ref)} className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.navigation.title`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.navigation.description`)}</p>

              {/* Mockup: sidebar nav (dark mode) */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-zinc-950 text-white p-4">
                  <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wider font-medium">{t(`${ns}.navigation.mockupLabel`)}</p>

                  {/* Tenant branding */}
                  <div className="flex items-center gap-3 mb-5 px-2">
                    <div className="size-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">H</div>
                    <span className="text-sm font-medium">Minha Escola Digital</span>
                  </div>

                  {/* Nav items */}
                  <div className="space-y-1">
                    {MOCK_NAV_ITEMS.map(({ icon: Icon, labelKey, active }) => (
                      <div
                        key={labelKey}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{t(`${ns}.navigation.${labelKey}`)}</span>
                      </div>
                    ))}
                  </div>

                  {/* User menu */}
                  <Separator className="my-4 bg-zinc-800" />
                  <div className="flex items-center gap-3 px-2">
                    <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">MS</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Maria Silva</p>
                      <p className="text-xs text-zinc-500 truncate">maria@email.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nav explanation */}
              <div className="mt-6 rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t(`${ns}.navigation.tablePage`)}</TableHead>
                      <TableHead>{t(`${ns}.navigation.tableDescription`)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { icon: House, page: "navigation.home", desc: "navigation.homeDesc" },
                      { icon: User, page: "navigation.profile", desc: "navigation.profileDesc" },
                      { icon: Receipt, page: "navigation.orders", desc: "navigation.ordersDesc" },
                      { icon: ShoppingBag, page: "navigation.products", desc: "navigation.productsDesc" },
                    ].map(({ icon: Icon, page, desc }) => (
                      <TableRow key={page}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-muted-foreground" />
                            <span className="font-medium">{t(`${ns}.${page}`)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-normal">
                          {t(`${ns}.${desc}`)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Products & Access */}
            <section id="products-access" ref={(ref) => addRef("products-access", ref)} className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.productsAccess.title`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.productsAccess.description`)}</p>

              {/* Mockup: product cards (dark mode) */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-zinc-950 p-6">
                  <p className="text-xs text-zinc-400 mb-4 uppercase tracking-wider font-medium">{t(`${ns}.productsAccess.mockupLabel`)}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {MOCK_PRODUCTS.map((product) => (
                      <div
                        key={product.name}
                        className={cn(
                          "rounded-xl border overflow-hidden transition-all",
                          product.hasAccess
                            ? "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                            : "border-zinc-800/50 bg-zinc-900/50 opacity-50"
                        )}
                      >
                        {/* Product image placeholder */}
                        <div className="aspect-video bg-zinc-800 relative flex items-center justify-center">
                          {product.type === "course" ? (
                            <PlayCircle className="size-8 text-zinc-600" />
                          ) : (
                            <FileText className="size-8 text-zinc-600" />
                          )}
                          {!product.hasAccess && (
                            <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                              <Lock className="size-5 text-zinc-500" />
                            </div>
                          )}
                          {product.progress != null && product.hasAccess && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                              <div
                                className="h-full bg-indigo-500 transition-all"
                                style={{ width: `${product.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-white truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              product.type === "course"
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            )}>
                              {product.type === "course" ? t(`${ns}.productsAccess.typeCourse`) : t(`${ns}.productsAccess.typeFiles`)}
                            </span>
                            {product.progress != null && product.hasAccess && (
                              <span className="text-[10px] text-zinc-500">{product.progress}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Access explanation */}
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="size-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-sm">{t(`${ns}.productsAccess.hasAccessTitle`)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t(`${ns}.productsAccess.hasAccessDesc`)}</p>
                </div>
                <div className="rounded-xl border border-zinc-500/20 bg-zinc-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="size-4 text-zinc-500" />
                    <span className="font-medium text-sm">{t(`${ns}.productsAccess.noAccessTitle`)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t(`${ns}.productsAccess.noAccessDesc`)}</p>
                </div>
              </div>
            </section>

            {/* Orders section */}
            <section id="orders" ref={(ref) => addRef("orders", ref)} className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.orders.title`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.orders.description`)}</p>

              {/* Mockup: orders table (dark mode) */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-zinc-950 p-6">
                  <p className="text-xs text-zinc-400 mb-4 uppercase tracking-wider font-medium">{t(`${ns}.orders.mockupLabel`)}</p>
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">{t(`${ns}.orders.colProduct`)}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">{t(`${ns}.orders.colAmount`)}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 hidden sm:table-cell">{t(`${ns}.orders.colDate`)}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_ORDERS.map((order) => (
                          <tr key={order.product} className="border-b border-zinc-800/50 last:border-0">
                            <td className="px-4 py-3 text-white font-medium">{order.product}</td>
                            <td className="px-4 py-3 text-zinc-300 tabular-nums">{order.amount}</td>
                            <td className="px-4 py-3">
                              <Badge variant={order.variant}>{t(`orders.statusLabels.${order.status}`)}</Badge>
                            </td>
                            <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Files & courses */}
            <section id="files-courses" ref={(ref) => addRef("files-courses", ref)} className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">{t(`${ns}.filesCourses.title`)}</h2>
              <p className="text-muted-foreground mb-6">{t(`${ns}.filesCourses.description`)}</p>

              {/* Two columns: files mockup + course mockup */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Files mockup */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-zinc-950 p-5">
                    <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wider font-medium">{t(`${ns}.filesCourses.filesLabel`)}</p>
                    <div className="space-y-2">
                      {MOCK_FILES.map((file) => (
                        <div key={file.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="size-4 text-zinc-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">{file.name}</p>
                              <p className="text-xs text-zinc-500">{file.size}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 shrink-0 ml-2">
                            <Download className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Course sidebar mockup */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-zinc-950 p-5">
                    <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wider font-medium">{t(`${ns}.filesCourses.coursesLabel`)}</p>
                    <p className="text-sm font-medium text-white mb-3">Módulo 1 — Fundamentos</p>
                    <div className="space-y-1.5">
                      {MOCK_LESSONS.map((lesson) => (
                        <div key={lesson.title} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800/50 transition-colors">
                          <div className="size-10 shrink-0 rounded bg-zinc-800 flex items-center justify-center relative">
                            <PlayCircle className="size-4 text-zinc-500" />
                            {lesson.completed && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-b" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium truncate">{lesson.title}</p>
                            <p className="text-[10px] text-zinc-500">{lesson.duration}</p>
                          </div>
                          <div className={cn(
                            "size-4 shrink-0 rounded border-2 flex items-center justify-center",
                            lesson.completed
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-zinc-600"
                          )}>
                            {lesson.completed && <Check className="size-2.5 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="mt-6">
                <Lightbulb className="size-4" />
                <AlertTitle>{t("guides.tip")}</AlertTitle>
                <AlertDescription>{t(`${ns}.filesCourses.tip`)}</AlertDescription>
              </Alert>
            </section>

            {/* Best practices */}
            <section id="best-practices" ref={(ref) => addRef("best-practices", ref)} className="mt-12 mb-8">
              <h2 className="text-2xl font-semibold mb-6">{t(`${ns}.bestPractices.title`)}</h2>

              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    <p className="font-medium text-foreground mb-1">{t(`${ns}.bestPractices.tip${i}Title`)}</p>
                    <p className="text-sm text-muted-foreground">{t(`${ns}.bestPractices.tip${i}Desc`)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar TOC (desktop) */}
          <div className="sticky top-24 col-span-3 col-start-10 hidden h-fit lg:block">
            <span className="text-lg font-medium">{t("guides.onThisPage")}</span>
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
              {t("guides.backToTop")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
