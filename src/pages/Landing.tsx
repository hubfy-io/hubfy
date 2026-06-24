import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { FeatureMockup, DashboardMockup, CheckoutMockup, EmailBroadcastsMockup } from "@/components/landing/LandingMockups";

/* ─── Data ─── */

const people = [
  { name: "Ethan Caldwell", role: "Business coach", bg: "bg-gradient-to-br from-amber-900 to-amber-700", image: "/images/ethan-caldwell.webp" },
  { name: "Tyler Brennan", role: "Sales specialist", bg: "bg-gradient-to-br from-stone-800 to-stone-600", image: "/images/tyler-brennan.webp" },
  { name: "Charlotte Webb", role: "Holistic therapist", bg: "bg-gradient-to-br from-rose-900 to-rose-700", image: "/images/charlotte-webb.webp" },
  { name: "Oliver Whitfield", role: "Startup mentor", bg: "bg-gradient-to-br from-zinc-800 to-zinc-600", image: "/images/oliver-whitfield.webp" },
  { name: "Lucía Herrera", role: "Functional nutritionist", bg: "bg-gradient-to-br from-emerald-900 to-emerald-700", image: "/images/lucia-herrera.webp" },
  { name: "Eero Virtanen", role: "Financial coach", bg: "bg-gradient-to-br from-slate-800 to-slate-600", image: "/images/eero-virtanen.webp" },
  { name: "Aaron Carter", role: "UX designer", bg: "bg-gradient-to-br from-violet-900 to-violet-700", image: "/images/aaron-carter.webp" },
  { name: "Joon-ho Park", role: "Tech instructor", bg: "bg-gradient-to-br from-cyan-900 to-cyan-700", image: "/images/joon-ho-park.webp" },
  { name: "Arjun Mehta", role: "Mindset coach", bg: "bg-gradient-to-br from-indigo-900 to-indigo-700", image: "/images/arjun-mehta.webp" },
];

const stats = [
  { value: "100K+", label: "Businesses built by experts" },
  { value: "$10B+", label: "Earned by experts" },
  { value: "75M+", label: "Customers served by experts" },
];

const features = [
  {
    id: "courses",
    label: "Courses",
    title: "Courses",
    description: "Turn your knowledge into a scalable product that sells without trading time for money.",
    gradient: "from-amber-900/80 via-stone-800/60 to-stone-900/80",
    mockup: "course",
  },
  {
    id: "coaching",
    label: "Coaching",
    title: "Coaching",
    description: "Work directly with clients at premium prices using structured programs and payments.",
    gradient: "from-emerald-900/80 via-stone-800/60 to-stone-900/80",
    mockup: "coaching",
  },
  {
    id: "communities",
    label: "Communities",
    title: "Communities",
    description: "Build a space people return to... where connection drives retention and recurring revenue.",
    gradient: "from-sky-900/80 via-stone-800/60 to-stone-900/80",
    mockup: "community",
  },
  {
    id: "memberships",
    label: "Memberships",
    title: "Memberships",
    description: "Create predictable income with ongoing access to content, connection, or support.",
    gradient: "from-violet-900/80 via-stone-800/60 to-stone-900/80",
    mockup: "membership",
  },
  {
    id: "downloads",
    label: "Downloads",
    title: "Downloads",
    description: "Sell digital files, templates, and resources for instant download.",
    gradient: "from-orange-900/80 via-stone-800/60 to-stone-900/80",
    mockup: "download",
  },
];


const testimonials = [
  {
    name: "Ethan Caldwell",
    role: "Business coach",
    image: "/images/ethan-caldwell.webp",
    quote: "There were so many different things that I was trying to cobble together using various solutions... I moved over to Hubfy and had all that stuff under one roof, which was a blessing for my business.",
    stat: "$10M+",
    statLabel: "Earned on Hubfy",
  },
  {
    name: "Charlotte Webb",
    role: "Holistic therapist",
    image: "/images/charlotte-webb.webp",
    quote: "I was just a therapist with an idea. Hubfy gave me the tools to be able to take all these ideas that I had and put them somewhere.",
    stat: "$600K+",
    statLabel: "Earned on Hubfy",
  },
  {
    name: "Arjun Mehta",
    role: "Mindset coach",
    image: "/images/arjun-mehta.webp",
    quote: "I did a two week trial with Hubfy and within a day I realized how much easier everything was for me. It gave my systems some sort of a focus and organization that I actually started really making money.",
    stat: "$2M+",
    statLabel: "Earned on Hubfy",
  },
];

/* ─── Component ─── */

export default function Landing() {

  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const prevTestimonial = useCallback(() => {
    setTestimonialIdx((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  }, []);
  const nextTestimonial = useCallback(() => {
    setTestimonialIdx((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══ HEADER ═══ */}
      <LandingHeader showLanguageSwitcher={false} />

      {/* ═══ HERO ═══ */}
      <section className="px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:pt-32">
        <div className="mx-auto max-w-[1200px] text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            The fastest way to sell digital products online
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Everything you need to turn digital products into revenue — courses, memberships, downloads and more.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/admin/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ PEOPLE CAROUSEL ═══ */}
      <section className="overflow-hidden pb-16 sm:pb-24">
        <div className="people-carousel-track flex gap-4">
          {/* Duplicate for infinite loop */}
          {[...people, ...people, ...people].map((person, i) => (
            <div
              key={i}
              className={`relative h-[320px] w-[240px] shrink-0 overflow-hidden rounded-2xl sm:h-[400px] sm:w-[280px] ${person.bg}`}
            >
              {person.image && (
                <img src={person.image} alt={person.name} className="absolute inset-0 h-full w-full object-cover" />
              )}
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16">
                <p className="text-sm font-semibold text-white">{person.name}</p>
                <p className="text-xs text-white/80">{person.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CSS animation for infinite scroll */}
        <style>{`
          .people-carousel-track {
            animation: people-scroll 30s linear infinite;
          }
          .people-carousel-track:hover {
            animation-play-state: paused;
          }
          @keyframes people-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-${people.length} * (240px + 16px))); }
          }
          @media (min-width: 640px) {
            @keyframes people-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-${people.length} * (280px + 16px))); }
            }
          }
        `}</style>
      </section>

      {/* ═══ STATS ═══ */}
      <section id="stats" className="border-y border-border/40 bg-secondary/50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section id="newsletter" className="bg-secondary/50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              You already know more than you think
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every week, we break down how real experts turn experience into
              sustainable revenue, with strategy and tools you can actually use.
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex w-full gap-2">
              <Input
                type="email"
                placeholder="Enter email..."
                className="flex-1"
              />
              <Button className="shrink-0">
                Get Weekly Insights
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES TABS ═══ */}
      <section
        id="features"
        className="bg-foreground px-4 py-16 text-background sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight sm:mb-12 sm:text-3xl lg:text-4xl">
            Choose how you turn expertise into income
          </h2>

          <Tabs defaultValue="courses" className="w-full">
            {/* Tab triggers */}
            <div className="mb-6 overflow-x-auto sm:mb-12 sm:flex sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsList className="h-auto gap-2 bg-transparent px-2 sm:flex-wrap sm:px-0">
                {features.map((f) => (
                  <TabsTrigger
                    key={f.id}
                    value={f.id}
                    className="shrink-0 rounded-full border border-background/20 px-4 py-2 text-sm text-background/60 hover:border-background/40 hover:text-background data-[state=active]:border-background data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab contents */}
            {features.map((f) => (
              <TabsContent key={f.id} value={f.id}>
                <div
                  className={`overflow-hidden rounded-2xl bg-gradient-to-br ${f.gradient} p-5 sm:p-8 lg:p-10`}
                >
                  {/* Text content */}
                  <div className="mb-5 max-w-lg sm:mb-6">
                    <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-sm text-white/70 sm:text-base">
                      {f.description}
                    </p>
                  </div>

                  {/* Mockup */}
                  <div className="mx-auto max-w-[540px] lg:max-w-[680px]">
                    <FeatureMockup type={f.mockup} />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ═══ OPERATING SYSTEM ═══ */}
      <section id="product" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          {/* Section heading */}
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              The operating system<br className="hidden sm:block" /> for human expertise
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Hubfy brings your entire business into one unified system.
              Experts grow faster when everything works together.
            </p>
          </div>

          {/* Content: Dashboard mockup + text */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Dashboard mockup */}
            <DashboardMockup />

            {/* Text content */}
            <div>
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                All-in-one that actually works
              </h3>
              <p className="mt-3 text-muted-foreground">
                Hubfy gives you one connected system to plan, build, and grow your business.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Products, payments, and marketing fully connected",
                  "Centralized view of your business",
                  "Tools built specifically for expert-led businesses",
                  "Less complexity and more momentum",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Replaces</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">Scattered tools</Badge>
                  <Badge variant="outline">Manual workflows</Badge>
                  <Badge variant="outline">Disconnected data</Badge>
                </div>
              </div>

              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to="/admin/signup">Start Free Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SELL WITH CONFIDENCE ═══ */}
      <section className="bg-secondary/30 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Text content */}
            <div>
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Sell with confidence
              </h3>
              <p className="mt-3 text-muted-foreground">
                Pricing, checkout, and delivery in one place.
                Hubfy payments enables lower fees and faster payouts so you keep more revenue.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Offer subscriptions, one-time payments, and plans",
                  "Upsells, downsells, and order bumps to drive revenue",
                  "Affiliate tools that turn customers into partners",
                  "Lower transaction costs and fast, predictable payouts",
                  "Automated tax calculation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Replaces</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">Thrivecart</Badge>
                  <Badge variant="outline">SamCart</Badge>
                  <Badge variant="outline">Gumroad</Badge>
                </div>
              </div>

              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to="/admin/signup">Start Free Trial</Link>
                </Button>
              </div>
            </div>

            {/* Checkout mockup */}
            <CheckoutMockup />
          </div>
        </div>
      </section>

      {/* ═══ FUNNELS THAT CONVERT ═══ */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Email broadcasts mockup */}
            <EmailBroadcastsMockup />

            {/* Text content */}
            <div>
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Funnels that convert
              </h3>
              <p className="mt-3 text-muted-foreground">
                Automated email sequences, opt-in forms, and smart
                segmentation — all built right in. Nurture leads and close
                deals without stitching tools together.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Visual automation builder for email sequences",
                  "Opt-in pages and forms with A/B testing",
                  "Smart tags and segmentation based on behavior",
                  "Track every touchpoint from click to conversion",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Replaces</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">Mailchimp</Badge>
                  <Badge variant="outline">Kit</Badge>
                  <Badge variant="outline">ActiveCampaign</Badge>
                </div>
              </div>

              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to="/admin/signup">Start Free Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY EXPERTS CHOOSE HUBFY ═══ */}
      <section id="clients" className="bg-foreground px-4 py-16 text-background sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight sm:mb-14 sm:text-3xl lg:text-4xl">
            Why experts choose Hubfy
          </h2>

          {/* Carousel container */}
          <div className="relative">
            {/* Cards wrapper with overflow visible for peek effect */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${testimonialIdx * 100}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full shrink-0 px-2">
                    <div className="mx-auto grid max-w-[900px] grid-cols-1 overflow-hidden rounded-2xl bg-background/5 sm:grid-cols-2">
                      {/* Photo */}
                      <div className="aspect-square bg-background/10">
                        <img
                          src={t.image}
                          alt={t.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Quote + stats */}
                      <div className="flex flex-col justify-center p-6 sm:p-8">
                        {/* Quotation mark */}
                        <span className="mb-4 text-4xl font-serif leading-none text-background/40">"</span>

                        <p className="text-sm leading-relaxed text-background/80 sm:text-base">
                          {t.quote}
                        </p>

                        <div className="mt-6">
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-xs text-background/60">{t.role}</p>
                        </div>

                        <div className="mt-8">
                          <p className="text-3xl font-semibold sm:text-4xl">{t.stat}</p>
                          <p className="mt-1 text-xs text-background/60">{t.statLabel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls: dots + arrows */}
            <div className="mt-8 flex items-center justify-between">
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`h-0.5 rounded-full transition-all ${
                      i === testimonialIdx
                        ? "w-6 bg-background"
                        : "w-4 bg-background/30"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2">
                <button
                  onClick={prevTestimonial}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-background/20 text-background/60 transition-colors hover:border-background/40 hover:text-background"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-background/20 text-background/60 transition-colors hover:border-background/40 hover:text-background"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
