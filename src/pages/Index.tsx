import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BookOpen,
  Users,
  Zap,
  Star,
  Play,
  GripVertical,
  Video,
  MessageSquare,
  Trophy,
  Bot,
  UsersRound,
  CreditCard,
  ShoppingCart,
  Crown,
  ChevronDown,
  Sparkles,
  BarChart3,
  Layout,
  FileText,
  Headphones,
  Image,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";

// ─── Componentes auxiliares da LP ────────────────────────────

function SectionTitle({
  badge,
  title,
  highlight,
  subtitle,
}: {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {badge && (
        <span className="mb-4 inline-block rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
          {badge}
        </span>
      )}
      <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
        {title}{" "}
        {highlight && <span className="text-primary">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function MockupWindow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/30 px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
      </div>
      {children}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-lg font-semibold transition-colors hover:text-primary"
      >
        {question}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-muted-foreground animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────

export default function Index() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: t("landing.tabs.catalog"), icon: Layout },
    { label: t("landing.tabs.salesPage"), icon: ShoppingCart },
    { label: t("landing.tabs.curriculum"), icon: FileText },
    { label: t("landing.tabs.lessons"), icon: Play },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/">
              <img
                src="/brand/logo-hubfy-light.svg"
                alt="Hubfy"
                className="h-[28px] w-auto hidden dark:block"
              />
              <img
                src="/brand/logo-hubfy-dark.svg"
                alt="Hubfy"
                className="h-[28px] w-auto dark:hidden"
              />
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                {t("landing.nav.product")}
              </span>
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                {t("landing.nav.features")}
              </span>
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                {t("landing.nav.pricing")}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <Link to="/dashboard">
                <Button>{t("landing.nav.dashboard")}</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t("landing.nav.login")}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">{t("landing.nav.startFree")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="container py-20 text-center lg:py-28">
        <div className="mx-auto max-w-4xl animate-fade-in">
          {/* Badge de social proof */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <div className="flex -space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-sm font-medium">{t("landing.hero.socialProof")}</span>
          </div>

          <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-primary">{t("landing.hero.titleHighlight")}</span>{" "}
            {t("landing.hero.titleRest")}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t("landing.hero.subtitle")}
          </p>

          {/* Email CTA */}
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              placeholder={t("landing.hero.emailPlaceholder")}
              className="h-12 rounded-full border-border/60 bg-card px-5"
            />
            <Link to="/signup">
              <Button size="lg" className="h-12 glow-primary w-full sm:w-auto px-8">
                {t("landing.hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ PRODUCT TABS ═══════════ */}
      <section className="container pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Tabs */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === i
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mockup da plataforma */}
          <div className="rounded-2xl bg-gradient-to-b from-primary/5 to-primary/0 p-4 sm:p-8">
            <MockupWindow>
              <div className="p-4 sm:p-6">
                {/* Nav bar do mockup */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20" />
                    <span className="text-sm font-semibold">{t("landing.mockup.myProduct")}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{t("landing.mockup.home")}</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {t("landing.mockup.courses")}
                    </span>
                    <span className="text-xs text-muted-foreground">{t("landing.mockup.events")}</span>
                    <span className="text-xs text-muted-foreground">{t("landing.mockup.clients")}</span>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-muted" />
                </div>

                {/* Conteúdo do mockup - muda com a tab */}
                {activeTab === 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">{t("landing.mockup.courses")}</h3>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                        {t("landing.mockup.all")}
                      </span>
                      <span className="rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground">
                        {t("landing.mockup.marketing")}
                      </span>
                      <span className="rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground">
                        {t("landing.mockup.design")}
                      </span>
                      <span className="rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground">
                        {t("landing.mockup.business")}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { title: t("landing.mockup.course1"), status: t("landing.mockup.course1Status"), color: "bg-green-500" },
                        { title: t("landing.mockup.course2"), status: t("landing.mockup.course2Status"), color: "bg-primary" },
                        { title: t("landing.mockup.course3"), status: t("landing.mockup.course3Status"), color: "bg-orange-500" },
                      ].map((course) => (
                        <div key={course.title} className="rounded-lg border border-border/50 overflow-hidden">
                          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5" />
                          <div className="p-3">
                            <h4 className="text-sm font-medium mb-1">{course.title}</h4>
                            <div className="flex items-center gap-1.5">
                              <div className={`h-1.5 w-1.5 rounded-full ${course.color}`} />
                              <span className="text-xs text-muted-foreground">{course.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="flex flex-col items-center py-8">
                    <div className="mb-4 h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t("landing.mockup.salesPageTitle")}</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      {t("landing.mockup.salesPageDesc")}
                    </p>
                    <div className="mt-6 flex gap-3">
                      <div className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground font-medium">{t("landing.mockup.buyCourse")}</div>
                      <div className="rounded-full border border-border px-5 py-2 text-sm">{t("landing.mockup.learnMore")}</div>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{t("landing.mockup.modulesAndLessons")}</h3>
                      <div className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {t("landing.mockup.addSection")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[t("landing.mockup.module1"), t("landing.mockup.module2"), t("landing.mockup.module3")].map(
                        (mod, i) => (
                          <div
                            key={mod}
                            className="flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                            <span className="text-sm font-medium">{mod}</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {t("landing.mockup.lessonsCount", { count: 3 + i })}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 3 && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="mb-2 text-xs text-muted-foreground">{t("landing.mockup.lessonOf", { current: 5, total: 12 })}</div>
                      <h3 className="text-lg font-semibold mb-3">{t("landing.mockup.lessonTitle")}</h3>
                      <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                        <div className="rounded-full bg-primary/20 p-4">
                          <Play className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="w-full sm:w-48 space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">{t("landing.mockup.content")}</div>
                      {[
                        { icon: Video, label: t("landing.mockup.video") },
                        { icon: FileText, label: t("landing.mockup.text") },
                        { icon: Headphones, label: t("landing.mockup.audio") },
                        { icon: Image, label: t("landing.mockup.files") },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                          <item.icon className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </MockupWindow>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF — LOGOS ═══════════ */}
      <section className="border-y border-border/30 bg-muted/10 py-12">
        <div className="container">
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {t("landing.socialProof.trustedBy")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50">
            {["Marca A", "Marca B", "Marca C", "Marca D", "Marca E", "Marca F"].map((brand) => (
              <span key={brand} className="text-lg font-semibold tracking-tight text-foreground/60">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 3 PILARES ═══════════ */}
      <section className="container py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: t("landing.pillars.create"),
              desc: t("landing.pillars.createDesc"),
            },
            {
              icon: MessageSquare,
              title: t("landing.pillars.engage"),
              desc: t("landing.pillars.engageDesc"),
            },
            {
              icon: BarChart3,
              title: t("landing.pillars.scale"),
              desc: t("landing.pillars.scaleDesc"),
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="group rounded-2xl border border-border/50 bg-card p-8 text-center transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mx-auto mb-5 inline-flex rounded-xl bg-primary/10 p-4">
                <pillar.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURE 1: CRIAÇÃO ═══════════ */}
      <section className="container py-24">
        <SectionTitle
          title={t("landing.featureCreation.title")}
          highlight={t("landing.featureCreation.highlight")}
          subtitle={t("landing.featureCreation.subtitle")}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Card 1 — Drag and drop */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              <span className="text-primary font-semibold">{t("landing.featureCreation.dragDrop")}</span>{" "}
              {t("landing.featureCreation.dragDropDesc")}
            </p>
            <MockupWindow className="mt-2">
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-semibold">{t("landing.featureCreation.courseName")}</span>
                  <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs">{t("landing.featureCreation.lessonsTab")}</span>
                </div>
                <div className="space-y-2">
                  {[t("landing.featureCreation.lesson1"), t("landing.featureCreation.lesson2"), t("landing.featureCreation.lesson3")].map((lesson) => (
                    <div
                      key={lesson}
                      className="flex items-center gap-2 rounded-md border border-border/40 bg-background p-2.5"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                      <span className="text-xs">{lesson}</span>
                      <span className="ml-auto rounded bg-green-500/10 px-2 py-0.5 text-[10px] text-green-600">
                        {t("landing.featureCreation.published")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </MockupWindow>
          </div>

          {/* Card 2 — Upload mídia */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              <span className="text-primary font-semibold">{t("landing.featureCreation.mediaTitle")}</span>{" "}
              {t("landing.featureCreation.mediaDesc")}
            </p>
            <div className="mt-2 rounded-xl border border-border/40 bg-background p-4">
              <div className="mb-2 text-xs text-muted-foreground">{t("landing.featureCreation.mediaLessonOf")}</div>
              <h4 className="mb-4 text-sm font-semibold">{t("landing.featureCreation.mediaLessonTitle")}</h4>
              <div className="flex gap-3">
                {[
                  { icon: Video, label: t("landing.featureCreation.video"), color: "text-red-500 bg-red-500/10" },
                  { icon: FileText, label: t("landing.featureCreation.text"), color: "text-blue-500 bg-blue-500/10" },
                  { icon: Headphones, label: t("landing.featureCreation.audio"), color: "text-green-500 bg-green-500/10" },
                  { icon: Image, label: t("landing.featureCreation.file"), color: "text-orange-500 bg-orange-500/10" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    <div className={`rounded-lg p-2.5 ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 aspect-video rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Play className="h-10 w-10 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE: MULTI-PLATAFORMA ═══════════ */}
      <section className="container py-24">
        <div className="rounded-2xl border border-border/50 bg-muted/20 p-8 sm:p-12 text-center">
          <p className="text-lg">
            {t("landing.multiPlatform.text")}{" "}
            <span className="text-primary font-semibold">{t("landing.multiPlatform.highlight")}</span>
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Desktop mockup */}
            <MockupWindow className="w-full max-w-sm">
              <div className="p-4">
                <div className="mb-2 text-xs text-muted-foreground">{t("landing.multiPlatform.lessonOf")}</div>
                <h4 className="text-sm font-semibold mb-3">{t("landing.multiPlatform.lessonTitle")}</h4>
                <div className="aspect-video rounded-md bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary/40" />
                </div>
              </div>
            </MockupWindow>

            {/* Mobile mockup */}
            <div className="w-40 rounded-3xl border-4 border-foreground/10 bg-background p-2 shadow-lg">
              <div className="rounded-2xl bg-card p-3">
                <div className="mb-2 h-1.5 w-12 mx-auto rounded-full bg-muted" />
                <div className="mb-2 text-[10px] font-semibold">{t("landing.multiPlatform.mobileTitle")}</div>
                <div className="aspect-video rounded-md bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-2">
                  <Play className="h-4 w-4 text-primary/40" />
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded bg-muted" />
                  <div className="h-1.5 w-3/4 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE 2: COMUNIDADE ═══════════ */}
      <section className="container py-24">
        <SectionTitle
          title={t("landing.featureCommunity.title")}
          highlight={t("landing.featureCommunity.highlight")}
          subtitle={t("landing.featureCommunity.subtitle")}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Espaços */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              <span className="text-primary font-semibold">{t("landing.featureCommunity.spaces")}</span>{" "}
              {t("landing.featureCommunity.spacesDesc")}
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary/20" />
                <span className="text-sm font-semibold">{t("landing.mockup.myProduct")}</span>
              </div>
              <div className="space-y-1.5 pl-2">
                {[t("landing.featureCommunity.feed"), t("landing.featureCommunity.welcome"), t("landing.featureCommunity.premiumCourses"), t("landing.featureCommunity.challenge21")].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted/50">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lives */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              <span className="text-primary font-semibold">{t("landing.featureCommunity.liveLessons")}</span>
              {t("landing.featureCommunity.liveLessonsDesc")}
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center relative overflow-hidden">
                <Play className="h-8 w-8 text-primary/40" />
                <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white font-medium">
                  {t("landing.featureCommunity.live")}
                </div>
              </div>
              <div className="mt-3 text-xs font-semibold">{t("landing.featureCommunity.mentorship")}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">{t("landing.featureCommunity.nextSession")}</div>
            </div>
          </div>

          {/* Ranking */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              <span className="text-primary font-semibold">{t("landing.featureCommunity.rankings")}</span>{" "}
              {t("landing.featureCommunity.rankingsDesc")}
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold">{t("landing.featureCommunity.level", { n: 4 })}</span>
                </div>
                <span className="text-xs text-muted-foreground">{t("landing.featureCommunity.pointsToNext", { n: 14 })}</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Ana Silva", level: 9, pos: 1 },
                  { name: "Carlos Lima", level: 8, pos: 2 },
                  { name: "Maria Santos", level: 7, pos: 3 },
                ].map((u) => (
                  <div key={u.name} className="flex items-center gap-3 rounded-md bg-muted/30 p-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
                      {u.pos}
                    </span>
                    <div className="h-6 w-6 rounded-full bg-muted" />
                    <span className="text-xs font-medium">{u.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{t("landing.featureCommunity.level", { n: u.level })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE 3: AUTOMAÇÃO ═══════════ */}
      <section className="container py-24">
        <SectionTitle
          title={t("landing.featureAutomation.title")}
          highlight={t("landing.featureAutomation.highlight")}
          subtitle={t("landing.featureAutomation.subtitle")}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Lembretes automáticos */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              <span className="text-primary font-semibold">{t("landing.featureAutomation.reminders")}</span>{" "}
              {t("landing.featureAutomation.remindersDesc")}
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">{t("landing.featureAutomation.assistant")}</span>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-2">
                <p className="text-xs" dangerouslySetInnerHTML={{ __html: t("landing.featureAutomation.reminderMsg") }} />
              </div>
              <div className="rounded-lg border border-border/50 p-2 text-center">
                <span className="text-xs font-medium text-primary">{t("landing.featureAutomation.continueCourse")}</span>
              </div>
            </div>
          </div>

          {/* Organização automática */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              <span className="text-primary font-semibold">{t("landing.featureAutomation.organize")}</span>{" "}
              {t("landing.featureAutomation.organizeDesc")}
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4">
              <div className="mb-3 text-sm font-semibold">{t("landing.featureAutomation.studentProgress")}</div>
              <div className="space-y-2">
                {[
                  { name: "João P.", progress: 100, color: "bg-green-500" },
                  { name: "Maria L.", progress: 77, color: "bg-primary" },
                  { name: "Pedro R.", progress: 45, color: "bg-orange-500" },
                ].map((student) => (
                  <div key={student.name} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
                    <span className="text-xs font-medium w-16">{student.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${student.color}`}
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{student.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE 4: ESCALAR ═══════════ */}
      <section className="container py-24">
        <SectionTitle
          title={t("landing.featureScale.title")}
          highlight={t("landing.featureScale.highlight")}
          subtitle={t("landing.featureScale.subtitle")}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Pricing */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              {t("landing.featureScale.pricingOptionsPrefix")}{" "}
              <span className="text-primary font-semibold">{t("landing.featureScale.pricingOptions")}</span>
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4 space-y-3">
              <div className="text-sm font-semibold">{t("landing.featureScale.fullCourse")}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border-2 border-primary bg-primary/5 p-2.5">
                  <div className="h-3 w-3 rounded-full border-2 border-primary bg-primary" />
                  <div>
                    <span className="text-sm font-semibold">R$ 497</span>
                    <span className="ml-2 rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-600 font-medium">
                      {t("landing.featureScale.bestValue")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-border/50 p-2.5">
                  <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-sm">R$ 49/mês</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-xs text-muted-foreground">{t("landing.featureScale.totalToday")}</span>
                <span className="text-sm font-semibold">R$ 497</span>
              </div>
            </div>
          </div>

          {/* Sales page */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              {t("landing.featureScale.salesPagesPrefix")}{" "}
              <span className="text-primary font-semibold">{t("landing.featureScale.salesPages")}</span>{" "}
              {t("landing.featureScale.salesPagesSuffix")}
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-sm font-semibold mb-1">{t("landing.featureScale.unlockPotential")}</h4>
              <p className="text-[10px] text-muted-foreground mb-4">
                {t("landing.featureScale.unlockDesc")}
              </p>
              <div className="w-full rounded-full bg-primary py-2 text-xs text-primary-foreground font-medium">
                {t("landing.featureScale.buyCourse")}
              </div>
              <div className="mt-2 w-full rounded-full border border-border py-2 text-xs">
                {t("landing.featureScale.learnMore")}
              </div>
            </div>
          </div>

          {/* Memberships */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6">
            <p className="mb-4">
              {t("landing.featureScale.loyalPrefix")}{" "}
              <span className="text-primary font-semibold">{t("landing.featureScale.loyalCustomers")}</span>{" "}
              {t("landing.featureScale.loyalSuffix")}
            </p>
            <div className="rounded-xl border border-border/40 bg-background p-4">
              <div className="flex flex-col items-center mb-4">
                <Crown className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs font-semibold">{t("landing.featureScale.vipSubscription")}</span>
              </div>
              <div className="space-y-2">
                {[
                  { plan: t("landing.featureScale.silver"), price: "R$ 49/mês" },
                  { plan: t("landing.featureScale.gold"), price: "R$ 97/mês" },
                  { plan: t("landing.featureScale.premium"), price: "R$ 197/mês" },
                ].map((item) => (
                  <div key={item.plan} className="flex items-center justify-between rounded-md border border-border/50 p-2.5">
                    <span className="text-xs font-medium">{item.plan}</span>
                    <span className="text-xs text-muted-foreground">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 w-full rounded-full bg-foreground py-2 text-center text-xs text-background font-medium">
                {t("landing.featureScale.upgrade")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA DARK ═══════════ */}
      <section className="relative overflow-hidden bg-foreground py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        <div className="container relative text-center">
          <h2 className="mb-4 text-3xl font-semibold text-background sm:text-4xl lg:text-5xl">
            {t("landing.ctaDark.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-background/60">
            {t("landing.ctaDark.subtitle")}
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              placeholder={t("landing.ctaDark.emailPlaceholder")}
              className="h-12 rounded-full border-background/20 bg-background/10 px-5 text-background placeholder:text-background/40"
            />
            <Link to="/signup">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8">
                {t("landing.ctaDark.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF — CRIADORES ═══════════ */}
      <section className="container py-24">
        <SectionTitle
          title={t("landing.creators.title")}
          highlight={t("landing.creators.highlight")}
          subtitle={t("landing.creators.subtitle")}
        />
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {[
            { name: t("landing.creators.creator1"), role: t("landing.creators.role1") },
            { name: t("landing.creators.creator2"), role: t("landing.creators.role2") },
            { name: t("landing.creators.creator3"), role: t("landing.creators.role3") },
            { name: t("landing.creators.creator4"), role: t("landing.creators.role4") },
            { name: t("landing.creators.creator5"), role: t("landing.creators.role5") },
            { name: t("landing.creators.creator6"), role: t("landing.creators.role6") },
          ].map((creator) => (
            <div
              key={creator.name}
              className="group flex flex-col items-center rounded-2xl border border-border/30 bg-card p-5 text-center transition-all hover:border-primary/30 hover:shadow-md w-36"
            >
              <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5" />
              <span className="text-xs font-semibold">{creator.name}</span>
              <span className="text-[10px] text-muted-foreground">{creator.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="container py-24">
        <SectionTitle title={t("landing.faq.title")} />
        <div className="mx-auto mt-12 max-w-2xl">
          <FAQItem question={t("landing.faq.q1")} answer={t("landing.faq.a1")} />
          <FAQItem question={t("landing.faq.q2")} answer={t("landing.faq.a2")} />
          <FAQItem question={t("landing.faq.q3")} answer={t("landing.faq.a3")} />
          <FAQItem question={t("landing.faq.q4")} answer={t("landing.faq.a4")} />
          <FAQItem question={t("landing.faq.q5")} answer={t("landing.faq.a5")} />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("landing.faq.stillHaveQuestions")}{" "}
            <span className="text-primary cursor-pointer font-medium hover:underline">
              {t("landing.faq.talkToTeam")}
            </span>
          </p>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="relative overflow-hidden bg-foreground py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
        {/* Avatar placeholders flutuantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-[10%] h-20 w-20 rounded-2xl bg-primary/10 rotate-6" />
          <div className="absolute top-12 right-[15%] h-16 w-16 rounded-2xl bg-primary/15 -rotate-6" />
          <div className="absolute bottom-16 left-[20%] h-14 w-14 rounded-2xl bg-primary/10 rotate-12" />
          <div className="absolute bottom-8 right-[10%] h-18 w-18 rounded-2xl bg-primary/15 -rotate-3" />
        </div>

        <div className="container relative text-center">
          <h2 className="mb-4 text-3xl font-semibold text-background sm:text-4xl lg:text-5xl">
            {t("landing.ctaFinal.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-background/60">
            {t("landing.ctaFinal.subtitle")}
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              placeholder={t("landing.ctaFinal.emailPlaceholder")}
              className="h-12 rounded-full border-background/20 bg-background/10 px-5 text-background placeholder:text-background/40"
            />
            <Link to="/signup">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8">
                {t("landing.ctaFinal.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Coluna 1 — Marca */}
            <div>
              <div className="mb-4">
                <img
                  src="/brand/logo-hubfy-light.svg"
                  alt="Hubfy"
                  className="h-[22px] w-auto hidden dark:block"
                />
                <img
                  src="/brand/logo-hubfy-dark.svg"
                  alt="Hubfy"
                  className="h-[22px] w-auto dark:hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("landing.footer.description")}
              </p>
            </div>

            {/* Coluna 2 — Produto */}
            <div>
              <h4 className="mb-4 text-sm font-semibold">{t("landing.footer.product")}</h4>
              <ul className="space-y-2">
                {(t("landing.footer.productLinks", { returnObjects: true }) as string[]).map((item: string) => (
                  <li key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna 3 — Recursos */}
            <div>
              <h4 className="mb-4 text-sm font-semibold">{t("landing.footer.resources")}</h4>
              <ul className="space-y-2">
                {(t("landing.footer.resourceLinks", { returnObjects: true }) as string[]).map((item: string) => (
                  <li key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna 4 — Empresa */}
            <div>
              <h4 className="mb-4 text-sm font-semibold">{t("landing.footer.company")}</h4>
              <ul className="space-y-2">
                {(t("landing.footer.companyLinks", { returnObjects: true }) as string[]).map((item: string) => (
                  <li key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {t("landing.footer.copyright")}
            </p>
            <div className="flex items-center gap-4">
              {["Twitter", "LinkedIn", "YouTube", "Instagram"].map((social) => (
                <span
                  key={social}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
