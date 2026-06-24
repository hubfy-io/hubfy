import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, Mail, Layers, Filter, UsersRound, ChevronDown } from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Data ─── */

const plans = [
  {
    name: "Basic",
    description: "You have an audience — now create your first digital product.",
    monthlyPrice: 179,
    annualPrice: 143,
    annualSave: 431,
    features: [
      "5 Products",
      "2,500 Contacts",
      "1 Website",
      "1 Community",
      "2 Admin Users",
    ],
    moreFeatures: 5,
    popular: false,
  },
  {
    name: "Growth",
    description: "Already bringing in revenue? Let's automate, elevate and scale.",
    monthlyPrice: 249,
    annualPrice: 199,
    annualSave: 600,
    features: [
      "50 Products",
      "25,000 Contacts",
      "1 Website",
      "1 Community",
      "11 Admin Users",
    ],
    moreFeatures: 12,
    popular: true,
  },
  {
    name: "Pro",
    description: "No limits, full customization and dedicated support.",
    monthlyPrice: 499,
    annualPrice: 399,
    annualSave: 1200,
    features: [
      "Unlimited Products",
      "100,000 Contacts",
      "3 Websites",
      "3 Communities",
      "26 Admin Users",
    ],
    moreFeatures: 17,
    popular: false,
  },
];

const unlimitedFeatures = [
  {
    icon: Mail,
    title: "Marketing emails",
    description: "Reach inboxes effortlessly with beautiful, easy-to-send emails.",
  },
  {
    icon: Layers,
    title: "Landing pages",
    description: "Turn visitors into leads with high-converting pages.",
  },
  {
    icon: Filter,
    title: "Funnels",
    description: "Grow sales faster with ready-to-launch funnels that convert.",
  },
  {
    icon: UsersRound,
    title: "Access groups",
    description: "Foster engagement through community groups and spaces.",
  },
];

type CellValue = string | boolean;

const comparisonTable: { category: string; rows: { feature: string; basic: CellValue; growth: CellValue; pro: CellValue }[] }[] = [
  {
    category: "Platform & Creator Tools",
    rows: [
      { feature: "Products", basic: "5", growth: "50", pro: "Unlimited" },
      { feature: "Communities", basic: "1", growth: "1", pro: "3" },
      { feature: "Access Groups", basic: "Unlimited", growth: "Unlimited", pro: "Unlimited" },
      { feature: "Funnels", basic: "Unlimited", growth: "Unlimited", pro: "Unlimited" },
      { feature: "Websites", basic: "1", growth: "1", pro: "3" },
      { feature: "Landing Pages", basic: "Unlimited", growth: "Unlimited", pro: "Unlimited" },
      { feature: "Marketing Emails", basic: "Unlimited", growth: "Unlimited", pro: "Unlimited" },
      { feature: "Creator Studio", basic: true, growth: true, pro: true },
      { feature: "Customer App", basic: true, growth: true, pro: true },
      { feature: "Cohorts Courses", basic: false, growth: true, pro: true },
      { feature: "Video Transcriptions & Translations", basic: false, growth: true, pro: true },
      { feature: "Branded Mobile App", basic: false, growth: false, pro: "Included ($199/mo value)" },
      { feature: "API", basic: false, growth: false, pro: "Included ($25/mo value)" },
      { feature: "Custom Code Editor", basic: false, growth: false, pro: true },
    ],
  },
  {
    category: "Sales & Monetization",
    rows: [
      { feature: "Affiliate Programs", basic: false, growth: true, pro: true },
      { feature: "Custom Domain", basic: true, growth: true, pro: true },
      { feature: "Checkout Pages", basic: true, growth: true, pro: true },
      { feature: "Payment Integrations", basic: true, growth: true, pro: true },
    ],
  },
  {
    category: "Automation & Customer Management",
    rows: [
      { feature: "Contacts", basic: "2,500", growth: "25,000", pro: "100,000" },
      { feature: "Admin Users", basic: "2", growth: "11", pro: "26" },
      { feature: "Email Automations", basic: true, growth: true, pro: true },
      { feature: "Tags & Segments", basic: true, growth: true, pro: true },
      { feature: "Advanced Automations", basic: false, growth: true, pro: true },
    ],
  },
];

const faqItems = [
  {
    question: "What is Hubfy?",
    answer:
      "Hubfy is an all-in-one platform that helps creators, coaches, and entrepreneurs build, market, and sell digital products — including online courses, memberships, communities, and coaching programs — all from a single dashboard.",
  },
  {
    question: "Who is Hubfy for?",
    answer:
      "Hubfy is designed for knowledge entrepreneurs — coaches, course creators, authors, speakers, and experts who want to monetize their expertise online without juggling multiple tools.",
  },
  {
    question: "What can I build on Hubfy?",
    answer:
      "You can build online courses, membership sites, communities, coaching programs, digital downloads, landing pages, email funnels, and more — all from one platform.",
  },
  {
    question: "What makes Hubfy different from other platforms?",
    answer:
      "Unlike other platforms that charge transaction fees or limit your features, Hubfy gives you unlimited access to marketing emails, landing pages, funnels, and access groups on every plan — with zero revenue sharing.",
  },
  {
    question: "How does Hubfy help experts grow their business?",
    answer:
      "Hubfy provides built-in marketing tools — email campaigns, funnels, landing pages, automations — so you can attract leads, nurture them, and convert them into paying customers without any third-party integrations.",
  },
  {
    question: "Is Hubfy a good platform for selling digital products and expertise?",
    answer:
      "Absolutely. Hubfy was built from the ground up for selling digital products. With flexible checkout pages, payment integrations, affiliate programs, and analytics, it's everything you need to sell online.",
  },
  {
    question: "Is Hubfy good for beginners who want to grow into a larger business?",
    answer:
      "Yes! The Basic plan is perfect for getting started, and as your business grows you can upgrade to Growth or Pro for more products, contacts, and advanced features — all without switching platforms.",
  },
];

/* ─── Component ─── */

export default function Pricing() {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* ═══ HERO ═══ */}
      <section className="px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
        <div className="mx-auto max-w-[1200px] text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            One platform.<br />
            All your business needs.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
            All-in-one platform with transparent pricing.
            No hidden fees. No revenue sharing.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-border p-1">
            <button
              onClick={() => setBilling("annual")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === "annual"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual <span className="text-xs opacity-70">(save up to ${plans[2].annualSave.toLocaleString()})</span>
            </button>
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === "monthly"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </section>

      {/* ═══ PRICING CARDS ═══ */}
      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col overflow-hidden rounded-2xl border bg-card ${
                plan.popular
                  ? "border-[#486DF9]/60 shadow-lg"
                  : "border-border/60"
              }`}
            >
              {/* Most Popular badge */}
              {plan.popular && (
                <div className="bg-[#486DF9] py-2 text-center text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                {/* Plan name + Save badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {billing === "annual" && (
                    <Badge variant="outline" className="text-xs">
                      SAVE ${plan.annualSave.toLocaleString()}/YEAR
                    </Badge>
                  )}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                      ${billing === "annual" ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-base text-muted-foreground">/mo*</span>
                  </div>
                  {billing === "annual" && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Billed annually (${plan.monthlyPrice}/mo)
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button className="mt-6 w-full" size="lg" asChild>
                  <Link to="/admin/signup">Choose Plan</Link>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  No hidden fees. Cancel anytime.
                </p>

                {/* Features */}
                <div className="mt-6">
                  <p className="text-sm font-semibold">Core features:</p>
                  <ul className="mt-3 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 text-sm font-semibold hover:underline">
                    +{plan.moreFeatures} more features
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mx-auto mt-8 max-w-[1200px] text-center text-xs text-muted-foreground">
          * Processing fees apply. Rates vary by country and payment provider.
        </p>
      </section>

      {/* ═══ COMPARE FEATURES ═══ */}
      <section className="bg-foreground text-background px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Compare features
          </h2>

          {/* Sticky header — desktop: plan names + Choose Plan buttons; mobile: just plan names */}
          <div className="sticky top-16 z-30 -mx-4 bg-foreground px-4 sm:-mx-6 sm:px-6">
            <div className="mx-auto max-w-[1200px]">
              {/* Desktop header */}
              <div className="hidden border-b border-background/10 py-6 sm:grid sm:grid-cols-4 sm:items-end sm:gap-4">
                <div />
                {plans.map((plan) => (
                  <div key={plan.name} className="text-center">
                    <p className="text-sm font-semibold">{plan.name}</p>
                    <Button
                      size="sm"
                      className={`mt-3 w-full ${
                        plan.popular
                          ? "bg-[#486DF9] text-white hover:bg-[#3d5ed6]"
                          : "bg-background text-foreground hover:bg-background/90"
                      }`}
                      asChild
                    >
                      <Link to="/admin/signup">Choose Plan</Link>
                    </Button>
                  </div>
                ))}
              </div>

              {/* Mobile header */}
              <div className="grid grid-cols-3 border-b border-background/10 py-4 sm:hidden">
                {plans.map((plan) => (
                  <p key={plan.name} className="text-center text-sm font-semibold">{plan.name}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Table body */}
          <div className="mt-2">
            {comparisonTable.map((section) => (
              <div key={section.category}>
                {/* Category header */}
                <p className="border-b border-background/10 pb-3 pt-8 text-xs font-semibold uppercase tracking-widest text-background/50 sm:pt-10">
                  {section.category}
                </p>

                {section.rows.map((row) => (
                  <div key={row.feature}>
                    {/* Desktop row */}
                    <div className="hidden border-b border-dashed border-background/10 py-4 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
                      <p className="text-sm">{row.feature}</p>
                      {(["basic", "growth", "pro"] as const).map((key) => {
                        const val = row[key];
                        return (
                          <div key={key} className="flex justify-center">
                            {val === true ? (
                              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background/10">
                                <Check className="h-4 w-4" />
                              </span>
                            ) : val === false ? (
                              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background/5">
                                <Minus className="h-4 w-4 text-background/30" />
                              </span>
                            ) : (
                              <span className="text-sm">{val}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile row — feature name centered above 3 values */}
                    <div className="border-b border-dashed border-background/10 py-4 sm:hidden">
                      <p className="mb-3 text-center text-sm">{row.feature}</p>
                      <div className="grid grid-cols-3">
                        {(["basic", "growth", "pro"] as const).map((key) => {
                          const val = row[key];
                          return (
                            <div key={key} className="flex justify-center">
                              {val === true ? (
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background/10">
                                  <Check className="h-4 w-4" />
                                </span>
                              ) : val === false ? (
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background/5">
                                  <Minus className="h-4 w-4 text-background/30" />
                                </span>
                              ) : (
                                <span className="text-sm">{val}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:mt-16">
            {plans.map((plan) => (
              <Button
                key={plan.name}
                size="lg"
                className={`w-full ${
                  plan.popular
                    ? "bg-[#486DF9] text-white hover:bg-[#3d5ed6]"
                    : "bg-background text-foreground hover:bg-background/90"
                }`}
                asChild
              >
                <Link to="/admin/signup">
                  Choose {plan.name} — ${billing === "annual" ? plan.annualPrice : plan.monthlyPrice}/mo
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ UNLIMITED WHERE IT MATTERS ═══ */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight sm:mb-14 sm:text-4xl lg:text-5xl">
            Unlimited where it matters.<br className="hidden sm:block" />
            So you never hit a wall.
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {unlimitedFeatures.map((f) => (
              <div
                key={f.title}
                className="flex flex-col rounded-2xl border border-border/60 p-6"
              >
                <div className="mb-auto">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60">
                    <f.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="mt-12 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="bg-foreground text-background px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight sm:mb-14 sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-background/10"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline [&>svg]:text-background/40">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-background/60">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
