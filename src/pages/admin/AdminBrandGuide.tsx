import { useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Upload, Settings, Loader2, Plus, Check, X, AlertTriangle, Info, Search, Eye, EyeOff, MoreHorizontal, Download, ChevronDown } from "lucide-react";
import { ActionsMenu } from "@/components/admin/ActionsMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger as AccordionTrig } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/* ─── Sidebar structure ─── */
const topLevelSections = ["brand", "typography", "colors", "components", "utilities"] as const;
type Section = (typeof topLevelSections)[number];

const componentItems = [
  "Badges", "Buttons", "Inputs", "Cards", "Table", "Tabs", "Avatar",
  "Tooltip", "Dropdown", "Separator", "Skeleton", "Progress & Slider",
  "Inline Banners", "Dialog & Sheet", "Popover", "Accordion", "HoverCard",
  "Toggle", "Breadcrumb", "Pagination", "Icons",
];

/* ─── Color swatches ─── */
const colorTokens = [
  { name: "background", desc: "Page backgrounds", css: "hsl(var(--background))" },
  { name: "foreground", desc: "Primary text and icons", css: "hsl(var(--foreground))" },
  { name: "card", desc: "Card, popover and dialog backgrounds", css: "hsl(var(--card))" },
  { name: "border", desc: "Borders, dividers and inputs", css: "hsl(var(--border))" },
  { name: "muted", desc: "Subtle backgrounds and hover states", css: "hsl(var(--muted))" },
  { name: "muted-foreground", desc: "Secondary text and labels", css: "hsl(var(--muted-foreground))" },
  { name: "accent", desc: "Blue accent for links, CTAs and highlights", css: "hsl(var(--accent))" },
  { name: "destructive", desc: "Errors and destructive actions", css: "hsl(var(--destructive))" },
  { name: "success", desc: "Confirmations and positive status", css: "hsl(var(--success))" },
];

/* ─── Helpers ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function SectionAnchor({ id, title, description }: { id: string; title: string; description?: string }) {
  return (
    <div id={id} className="scroll-mt-8">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

const sectionLabels: Record<Section, string> = {
  brand: "Brand",
  typography: "Typography",
  colors: "Colors",
  components: "Components",
  utilities: "Utilities",
};

/* ═══════════════════════════════════════════════════════════
   CONTENT SECTIONS
   ═══════════════════════════════════════════════════════════ */

function BrandContent() {
  return (
    <section>
      <SectionAnchor id="Brand" title="Brand" description="Guidelines for using the Hubfy brand — logo, icon, colors, and usage rules." />

      <div className="mt-8 space-y-3">
        <SectionLabel>About Hubfy</SectionLabel>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Hubfy is a creator platform for digital products, memberships, and communities. The brand conveys simplicity, trust, and modernity. The cube icon represents structure and modularity — the building blocks of a creator's business.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <SectionLabel>Logo</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-8 gap-4">
            <img src="/brand/logo-hubfy-dark.svg" alt="Hubfy logo dark" className="h-8" />
            <span className="text-xs text-neutral-500">Light background</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-neutral-950 p-8 gap-4">
            <img src="/brand/logo-hubfy-light.svg" alt="Hubfy logo light" className="h-8" />
            <span className="text-xs text-neutral-500">Dark background</span>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/brand/logo-hubfy-dark.svg" download className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="size-3.5" /> logo-hubfy-dark.svg
          </a>
          <span className="text-xs text-muted-foreground">·</span>
          <a href="/brand/logo-hubfy-light.svg" download className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="size-3.5" /> logo-hubfy-light.svg
          </a>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <SectionLabel>Icon</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-6 gap-3">
            <img src="/brand/icon-hubfy-dark.svg" alt="Icon dark" className="h-10" />
            <span className="text-[10px] text-neutral-500">Light bg</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-neutral-950 p-6 gap-3">
            <img src="/brand/icon-hubfy-light.svg" alt="Icon light" className="h-10" />
            <span className="text-[10px] text-neutral-500">Dark bg</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl p-6 gap-3" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <img src="/brand/icon-hubfy-light.svg" alt="Icon on color" className="h-10" />
            <span className="text-[10px] text-white/60">Colored bg</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-transparent p-6 gap-3">
            <img src="/brand/icon-hubfy-dark.svg" alt="Icon transparent" className="h-10" />
            <span className="text-[10px] text-muted-foreground">Transparent</span>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/brand/icon-hubfy-dark.svg" download className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="size-3.5" /> icon-hubfy-dark.svg
          </a>
          <span className="text-xs text-muted-foreground">·</span>
          <a href="/brand/icon-hubfy-light.svg" download className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="size-3.5" /> icon-hubfy-light.svg
          </a>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <SectionLabel>Favicon</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-6 gap-3">
            <img src="/brand/favicon-dark.svg" alt="Favicon dark" className="h-8" />
            <span className="text-[10px] text-neutral-500">favicon-dark</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-neutral-950 p-6 gap-3">
            <img src="/brand/favicon-light.svg" alt="Favicon light" className="h-8" />
            <span className="text-[10px] text-neutral-500">favicon-light</span>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <SectionLabel>Brand colors</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Black", hex: "#000000" },
            { name: "White", hex: "#FFFFFF" },
            { name: "Foreground", hex: "hsl(var(--foreground))" },
            { name: "Muted", hex: "hsl(var(--muted-foreground))" },
          ].map((c) => (
            <div key={c.name} className="rounded-xl overflow-hidden border border-border">
              <div className="h-16" style={{ background: c.hex }} />
              <div className="px-3 py-2">
                <p className="text-xs font-medium">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.hex.startsWith("hsl") ? c.name.toLowerCase() : c.hex}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          The Hubfy brand uses a neutral black/white palette. The logo adapts to light and dark contexts — always use the appropriate version for contrast.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <SectionLabel>Usage rules</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card variant="bordered">
            <CardContent className="pt-5 space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Check className="size-4 text-emerald-500" /> Do
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Use the dark logo on light backgrounds</li>
                <li>Use the light logo on dark backgrounds</li>
                <li>Maintain clear space around the logo</li>
                <li>Download and use the original SVG files</li>
                <li>Keep the logo proportions — scale uniformly</li>
              </ul>
            </CardContent>
          </Card>
          <Card variant="bordered" className="border-destructive/30">
            <CardContent className="pt-5 space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <X className="size-4 text-destructive" /> Don&apos;t
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Stretch, rotate, or distort the logo</li>
                <li>Change the logo colors or add effects</li>
                <li>Place the dark logo on dark backgrounds</li>
                <li>Add shadows, gradients, or outlines</li>
                <li>Recreate the logo with a different font</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function TypographyContent() {
  return (
    <section>
      <SectionAnchor id="Typography" title="Typography" description="Font: Geist, system-ui, sans-serif. All headings use tracking-normal (0em)." />
      <div className="mt-8 space-y-6">
        <SectionLabel>Base heading styles (from index.css)</SectionLabel>
        {[
          { tag: "<h1>", spec: "text-2xl (1.5rem) · semibold · tracking-normal", el: <h1>Heading 1 — The quick brown fox</h1> },
          { tag: "<h2>", spec: "text-lg (1.125rem) · semibold · tracking-normal", el: <h2>Heading 2 — The quick brown fox</h2> },
          { tag: "<h3>", spec: "text-sm (0.875rem) · semibold · tracking-normal", el: <h3>Heading 3 — The quick brown fox</h3> },
          { tag: "<h4>", spec: "text-xs (0.75rem) · medium · tracking-normal", el: <h4>Heading 4 — The quick brown fox</h4> },
        ].map((h) => (
          <div key={h.tag} className="grid grid-cols-[60px_1fr_1fr] items-center gap-4">
            <code className="text-xs text-muted-foreground">{h.tag}</code>
            <span className="text-xs text-muted-foreground">{h.spec}</span>
            {h.el}
          </div>
        ))}
        <p className="text-xs text-muted-foreground italic">h5 and h6 have no base styles defined — they inherit browser defaults.</p>

        <Separator className="my-6" />
        <SectionLabel>Body text sizes</SectionLabel>
        {[
          { cls: "text-base", sizeClass: "text-base", size: "1rem (16px)", tracking: "tracking-normal (0em)", text: "Default body text for paragraphs and lists." },
          { cls: "text-sm", sizeClass: "text-sm", size: "0.875rem (14px)", tracking: "tracking-normal (0em)", text: "Small text for descriptions, placeholders and inputs." },
          { cls: "text-xs", sizeClass: "text-xs", size: "0.75rem (12px)", tracking: "tracking-normal (0em)", text: "Minimum text for timestamps, captions and metadata." },
          { cls: "text-2xs", sizeClass: "text-2xs", size: "0.625rem (10px)", tracking: "tracking-normal (0em)", text: "Custom size — micro labels." },
        ].map((t) => (
          <div key={t.cls} className="grid grid-cols-[100px_160px_160px_1fr] items-center gap-3">
            <code className="text-xs text-muted-foreground">{t.cls}</code>
            <span className="text-xs text-muted-foreground">{t.size}</span>
            <span className="text-xs text-muted-foreground">{t.tracking}</span>
            <p className={`${t.sizeClass} text-foreground`}>{t.text}</p>
          </div>
        ))}
        <div className="grid grid-cols-[100px_160px_160px_1fr] items-center gap-3">
          <code className="text-xs text-muted-foreground">section-label</code>
          <span className="text-xs text-muted-foreground">11px · medium</span>
          <span className="text-xs text-muted-foreground">tracking-widest (0.1em)</span>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Section label — uppercase utility</p>
        </div>

        <Separator className="my-6" />
        <SectionLabel>Letter spacing tokens</SectionLabel>
        <div className="bg-muted rounded-xl p-4 space-y-1">
          <p className="text-sm"><code className="text-xs bg-background px-1.5 py-0.5 rounded">tracking-tighter</code> -0.05em</p>
          <p className="text-sm"><code className="text-xs bg-background px-1.5 py-0.5 rounded">tracking-tight</code> -0.025em</p>
          <p className="text-sm"><code className="text-xs bg-background px-1.5 py-0.5 rounded">tracking-normal</code> 0em <Badge variant="secondary" className="ml-1">default</Badge></p>
          <p className="text-sm"><code className="text-xs bg-background px-1.5 py-0.5 rounded">tracking-wide</code> 0.025em</p>
          <p className="text-sm"><code className="text-xs bg-background px-1.5 py-0.5 rounded">tracking-wider</code> 0.05em</p>
          <p className="text-sm"><code className="text-xs bg-background px-1.5 py-0.5 rounded">tracking-widest</code> 0.1em <Badge variant="secondary" className="ml-1">section-label</Badge></p>
        </div>

        <Separator className="my-6" />
        <SectionLabel>Design system classes</SectionLabel>
        {[
          { cls: ".text-title", desc: "text-2xl · semibold · foreground · tracking-normal", example: <span className="text-title">Page title</span> },
          { cls: ".text-section", desc: "text-lg · semibold · foreground · tracking-normal", example: <span className="text-section">Content section</span> },
          { cls: ".text-body", desc: "text-sm · foreground", example: <span className="text-body">Regular body text</span> },
          { cls: ".text-label", desc: "text-xs · semibold · muted-foreground", example: <span className="text-label">Field label</span> },
          { cls: ".text-support", desc: "text-xs · muted-foreground", example: <span className="text-support">Support text</span> },
          { cls: ".text-meta", desc: "text-[10px] · muted-foreground/70", example: <span className="text-meta">Minimal metadata</span> },
        ].map((c) => (
          <div key={c.cls} className="grid grid-cols-[120px_1fr_1fr] items-center gap-4">
            <code className="text-xs text-foreground bg-muted px-2 py-0.5 rounded">{c.cls}</code>
            <span className="text-xs text-muted-foreground">{c.desc}</span>
            {c.example}
          </div>
        ))}

        <Separator className="my-6" />
        <SectionLabel>Text color variations</SectionLabel>
        <div className="space-y-2">
          <p className="text-foreground">text-foreground — Primary text, body and headings.</p>
          <p className="text-muted-foreground">text-muted-foreground — Secondary text, descriptions and placeholders.</p>
          <p className="text-accent">text-accent — Blue accent for links and CTAs.</p>
          <p className="text-destructive">text-destructive — Errors, alerts and destructive actions.</p>
        </div>
      </div>
    </section>
  );
}

function ColorsContent() {
  return (
    <section>
      <SectionAnchor id="Colors" title="Colors" description="10 base tokens + 4 status. Dark mode via .dark class on <html>. Showing current theme values." />
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {colorTokens.map((c) => (
          <div key={c.name}>
            <div className="h-20 rounded-xl border" style={{ backgroundColor: c.css }} />
            <p className="mt-2 text-sm font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-muted rounded-xl p-4">
        <p className="text-sm font-medium mb-1">Aliases kept for shadcn compatibility</p>
        <p className="text-xs text-muted-foreground">
          primary = foreground · secondary = muted · popover = background · input = border · ring = primary · sidebar-* inherits from base
        </p>
      </div>

      <div className="mt-6">
        <SectionLabel>Status colors</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "success", css: "hsl(var(--success))" },
            { name: "warning", css: "hsl(var(--warning))" },
            { name: "destructive", css: "hsl(var(--destructive))" },
          ].map((c) => (
            <div key={c.name}>
              <div className="h-14 rounded-xl" style={{ backgroundColor: c.css }} />
              <p className="mt-2 text-sm font-medium">{c.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel>Chart colors (1–5)</SectionLabel>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="text-center">
              <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: `hsl(var(--chart-${n}))` }} />
              <span className="text-[10px] text-muted-foreground mt-1 block">chart-{n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComponentsContent() {
  return (
    <div className="space-y-16">
      {/* ─── BADGES ─── */}
      <section>
        <SectionAnchor id="Badges" title="Badges" description="Pill-shaped (rounded-full). 3 base variants + 12-color palette + 4 semantic aliases." />
        <div className="mt-8 space-y-6">
          <SectionLabel>Base</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <SectionLabel>12-color palette</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Badge variant="gray">Gray</Badge>
            <Badge variant="red">Red</Badge>
            <Badge variant="orange">Orange</Badge>
            <Badge variant="amber">Amber</Badge>
            <Badge variant="yellow">Yellow</Badge>
            <Badge variant="lime">Lime</Badge>
            <Badge variant="green">Green</Badge>
            <Badge variant="teal">Teal</Badge>
            <Badge variant="blue">Blue</Badge>
            <Badge variant="indigo">Indigo</Badge>
            <Badge variant="purple">Purple</Badge>
            <Badge variant="pink">Pink</Badge>
          </div>
          <SectionLabel>Semantic aliases (map automatically)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive">destructive &rarr; red</Badge>
            <Badge variant="success">success &rarr; green</Badge>
            <Badge variant="warning">warning &rarr; amber</Badge>
            <Badge variant="info">info &rarr; blue</Badge>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── BUTTONS ─── */}
      <section>
        <SectionAnchor id="Buttons" title="Buttons" description="Variants: default, destructive, outline, secondary, ghost, link. Sizes: sm, default, lg, xl, icon." />
        <div className="mt-8 space-y-6">
          <SectionLabel>Variants</SectionLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <SectionLabel>Sizes</SectionLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          <SectionLabel>With icons</SectionLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button><Mail className="mr-2 h-4 w-4" />Send email</Button>
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload</Button>
            <Button variant="secondary"><Settings className="mr-2 h-4 w-4" />Settings</Button>
          </div>
          <SectionLabel>States</SectionLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
            <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── INPUTS ─── */}
      <section>
        <SectionAnchor id="Inputs" title="Inputs & Forms" description="Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select." />
        <div className="mt-8 max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-icon">Email (with icon)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email-icon" placeholder="you@email.com" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="font-normal">I agree to the terms of service</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="notifications" />
            <Label htmlFor="notifications" className="font-normal">Receive email notifications</Label>
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <RadioGroup defaultValue="weekly">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="font-normal">Daily</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="font-normal">Weekly</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="font-normal">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── CARDS ─── */}
      <section>
        <SectionAnchor id="Cards" title="Cards" description="Card with header, content and description. Includes card-container utilities." />
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Bordered Card</CardTitle>
              <CardDescription>Card with ring border — used in dashboards and KPIs.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Card content with relevant information.</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Bordered card with shadow — used for emphasis.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Card content with relevant information.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Transparent card without border — base variant.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Card content with relevant information.</p>
            </CardContent>
          </Card>
          <div className="card-container">
            <p className="text-section mb-2">card-container</p>
            <p className="text-sm text-muted-foreground">Utility class: rounded-2xl bg-card p-6</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── TABLE ─── */}
      <section>
        <SectionAnchor id="Table" title="Table" description="Responsive table with Eye button + ActionsMenu dropdown — the real pattern used across the app." />
        <div className="mt-8 rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Ana Silva", email: "ana@email.com", status: "success" as const },
                { name: "John Costa", email: "john@email.com", status: "warning" as const },
                { name: "Maria Santos", email: "maria@email.com", status: "destructive" as const },
              ].map((r) => (
                <TableRow key={r.name} className="cursor-pointer">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <Badge variant={r.status}>
                      {r.status === "success" ? "Active" : r.status === "warning" ? "Pending" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="size-4" />
                      </Button>
                      <ActionsMenu
                        items={[
                          { label: "Copy ID", onClick: () => {} },
                          { label: "View details", onClick: () => {} },
                          { label: "Delete", onClick: () => {}, destructive: true },
                        ]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator />

      {/* ─── TABS ─── */}
      <section>
        <SectionAnchor id="Tabs" title="Tabs" description="Line-variant tabs with bottom border indicator — the pattern used across the app." />
        <div className="mt-8 space-y-8">
          <div>
            <SectionLabel>variant=&quot;line&quot; (default usage)</SectionLabel>
            <Tabs defaultValue="general">
              <TabsList variant="line" className="shrink-0 border-b border-border w-full justify-start">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-4">
                <p className="text-sm text-muted-foreground">General tab content.</p>
              </TabsContent>
              <TabsContent value="advanced" className="mt-4">
                <p className="text-sm text-muted-foreground">Advanced tab content.</p>
              </TabsContent>
              <TabsContent value="integrations" className="mt-4">
                <p className="text-sm text-muted-foreground">Integrations tab content.</p>
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <SectionLabel>full-width tabs (sheets/modals)</SectionLabel>
            <Tabs defaultValue="details">
              <TabsList variant="line" className="w-full shrink-0 border-b border-border">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="payment" className="flex-1">Payment</TabsTrigger>
                <TabsTrigger value="emails" className="flex-1">Emails</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <p className="text-sm text-muted-foreground">Details tab content.</p>
              </TabsContent>
              <TabsContent value="payment" className="mt-4">
                <p className="text-sm text-muted-foreground">Payment tab content.</p>
              </TabsContent>
              <TabsContent value="emails" className="mt-4">
                <p className="text-sm text-muted-foreground">Emails tab content.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── AVATAR ─── */}
      <section>
        <SectionAnchor id="Avatar" title="Avatar" description="Avatar with rounded-lg shape, initials fallback — as used in sidebar and team lists." />
        <div className="mt-8 space-y-6">
          <div>
            <SectionLabel>with text (sidebar / nav pattern)</SectionLabel>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarImage src="/brand/avatar-hubfy.png" alt="Hubfy" />
                <AvatarFallback className="rounded-lg bg-card text-foreground text-xs">AS</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none truncate">Ana Silva</p>
                <p className="text-xs text-muted-foreground truncate">ana@hubfy.io</p>
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>sizes</SectionLabel>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarFallback className="rounded-lg bg-card text-foreground text-xs">AS</AvatarFallback>
              </Avatar>
              <Avatar className="size-9 shrink-0 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">JC</AvatarFallback>
              </Avatar>
              <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                <AvatarImage src="/brand/avatar-hubfy.png" alt="Hubfy" />
                <AvatarFallback className="rounded-lg bg-card text-foreground text-xs">HF</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── TOOLTIP ─── */}
      <section>
        <SectionAnchor id="Tooltip" title="Tooltip" description="Hover tooltip on badges and icon buttons — real patterns used in the app." />
        <div className="mt-8 space-y-6">
          <div>
            <SectionLabel>on badge (status help)</SectionLabel>
            <div className="flex gap-3">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="success" className="cursor-help">Active</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This item is active and visible to customers.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="warning" className="cursor-help">Processing</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Asset is being processed. This may take a few minutes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div>
            <SectionLabel>on icon button</SectionLabel>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <Info className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>More information about this feature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── DROPDOWN ─── */}
      <section>
        <SectionAnchor id="Dropdown" title="Dropdown Menu" description="Contextual menu with items, separators and shortcuts." />
        <div className="mt-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <Separator />

      {/* ─── SEPARATOR ─── */}
      <section>
        <SectionAnchor id="Separator" title="Separator" description="Horizontal and vertical separators." />
        <div className="mt-8 space-y-4">
          <p className="text-sm">Content above</p>
          <Separator />
          <p className="text-sm">Content below</p>
          <div className="flex items-center gap-4 h-6">
            <span className="text-sm">Item A</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Item B</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Item C</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── SKELETON ─── */}
      <section>
        <SectionAnchor id="Skeleton" title="Skeleton" description="Loading placeholder that preserves layout." />
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </section>

      <Separator />

      {/* ─── PROGRESS & SLIDER ─── */}
      <section>
        <SectionAnchor id="Progress & Slider" title="Progress & Slider" description="Progress indicators and range controls." />
        <div className="mt-8 max-w-md space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Progress (65%)</p>
            <Progress value={65} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Progress (30%)</p>
            <Progress value={30} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Slider</p>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── INLINE BANNERS ─── */}
      <section>
        <SectionAnchor id="Inline Banners" title="Inline Banners" description="Custom div-based banners used across the app — info, warning, error and loading states." />
        <div className="mt-8 space-y-4">
          <div>
            <SectionLabel>info banner</SectionLabel>
            <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
              <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-400">3 duplicated records found and will be skipped during import.</p>
            </div>
          </div>
          <div>
            <SectionLabel>warning banner (Card variant)</SectionLabel>
            <Card variant="bordered" className="border-warning/50 bg-warning/5">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <p className="text-sm text-muted-foreground flex-1">Email sending requires domain verification. Complete setup to continue.</p>
                <Button variant="outline" size="sm">Setup</Button>
              </CardContent>
            </Card>
          </div>
          <div>
            <SectionLabel>error banner</SectionLabel>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">Integration sync failed</p>
                <p className="text-xs text-muted-foreground mt-1">Connection timed out. Check your credentials and try again.</p>
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>loading banner</SectionLabel>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <Loader2 className="size-4 text-muted-foreground animate-spin shrink-0" />
              <p className="text-sm text-muted-foreground">Checking for duplicate records...</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── DIALOG & SHEET ─── */}
      <section>
        <SectionAnchor id="Dialog & Sheet" title="Dialog & Sheet" description="Modals and side panels for contextual actions." />
        <div className="mt-8 flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>Description of what happens in this dialog.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">Dialog content goes here.</p>
              </div>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
                <SheetDescription>Side panel for actions.</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <p className="text-sm">Sheet content goes here.</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <Separator />

      {/* ─── POPOVER ─── */}
      <section>
        <SectionAnchor id="Popover" title="Popover" description="Floating content activated by click." />
        <div className="mt-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <p className="text-sm font-medium">Filters</p>
                <p className="text-xs text-muted-foreground">Configure the list filters.</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      <Separator />

      {/* ─── ACCORDION ─── */}
      <section>
        <SectionAnchor id="Accordion" title="Accordion" description="Expandable content in sections." />
        <div className="mt-8 max-w-lg">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrig>What is Hubfy?</AccordionTrig>
              <AccordionContent>
                Hubfy is a membership platform for content creators.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrig>How does the design system work?</AccordionTrig>
              <AccordionContent>
                All components follow consistent color, typography and spacing tokens.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrig>Can I customize the components?</AccordionTrig>
              <AccordionContent>
                Yes, components are based on shadcn/ui and can be customized via className.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Separator />

      {/* ─── HOVERCARD ─── */}
      <section>
        <SectionAnchor id="HoverCard" title="HoverCard" description="Contextual card activated by hover." />
        <div className="mt-8">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 h-auto">@hubfy</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/brand/avatar-hubfy.png" alt="Hubfy" />
                  <AvatarFallback>HF</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Hubfy</p>
                  <p className="text-xs text-muted-foreground">Membership platform</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </section>

      <Separator />

      {/* ─── TOGGLE ─── */}
      <section>
        <SectionAnchor id="Toggle" title="Toggle" description="Toggle button with on/off states." />
        <div className="mt-8 flex gap-3">
          <Toggle aria-label="Bold"><span className="font-bold">B</span></Toggle>
          <Toggle aria-label="Italic"><span className="italic">I</span></Toggle>
          <Toggle aria-label="Eye"><Eye className="h-4 w-4" /></Toggle>
        </div>
      </section>

      <Separator />

      {/* ─── BREADCRUMB ─── */}
      <section>
        <SectionAnchor id="Breadcrumb" title="Breadcrumb" description="Hierarchical breadcrumb navigation." />
        <div className="mt-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Courses</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit module</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      <Separator />

      {/* ─── PAGINATION ─── */}
      <section>
        <SectionAnchor id="Pagination" title="Pagination" description="Page navigation for result sets." />
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>

      <Separator />

      {/* ─── ICONS ─── */}
      <section>
        <SectionAnchor id="Icons" title="Icons" description="Icons via Lucide React — consistent at 24px, stroke 2." />
        <div className="mt-8">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-4">
            {[
              { icon: <Mail className="h-5 w-5" />, name: "Mail" },
              { icon: <Upload className="h-5 w-5" />, name: "Upload" },
              { icon: <Settings className="h-5 w-5" />, name: "Settings" },
              { icon: <Search className="h-5 w-5" />, name: "Search" },
              { icon: <Check className="h-5 w-5" />, name: "Check" },
              { icon: <X className="h-5 w-5" />, name: "X" },
              { icon: <Plus className="h-5 w-5" />, name: "Plus" },
              { icon: <AlertTriangle className="h-5 w-5" />, name: "Alert" },
              { icon: <Info className="h-5 w-5" />, name: "Info" },
              { icon: <Eye className="h-5 w-5" />, name: "Eye" },
              { icon: <EyeOff className="h-5 w-5" />, name: "EyeOff" },
              { icon: <Loader2 className="h-5 w-5" />, name: "Loader" },
              { icon: <ArrowLeft className="h-5 w-5" />, name: "ArrowLeft" },
            ].map((i) => (
              <div key={i.name} className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted text-foreground">
                  {i.icon}
                </div>
                <span className="text-[10px] text-muted-foreground">{i.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function UtilitiesContent() {
  return (
    <section>
      <SectionAnchor id="Utilities" title="Utilities" description="Custom utility classes from the design system." />
      <div className="mt-8 space-y-6">
        <SectionLabel>Border Radius</SectionLabel>
        <div className="flex flex-wrap gap-4">
          {[
            { name: "sm (4px)", cls: "rounded-sm" },
            { name: "md (6px)", cls: "rounded-md" },
            { name: "lg (8px)", cls: "rounded-lg" },
            { name: "xl (12px)", cls: "rounded-xl" },
            { name: "2xl (16px)", cls: "rounded-2xl" },
            { name: "full", cls: "rounded-full" },
          ].map((r) => (
            <div key={r.name} className="text-center">
              <div className={`h-14 w-14 bg-foreground/10 border ${r.cls}`} />
              <span className="text-xs text-muted-foreground mt-1 block">{r.name}</span>
            </div>
          ))}
        </div>

        <SectionLabel>Shadows</SectionLabel>
        <div className="flex flex-wrap gap-6">
          {["shadow-2xs", "shadow-xs", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl"].map((s) => (
            <div key={s} className="text-center">
              <div className={`h-14 w-14 rounded-xl bg-card border ${s}`} />
              <span className="text-xs text-muted-foreground mt-1 block">{s}</span>
            </div>
          ))}
        </div>

        <SectionLabel>Gradients</SectionLabel>
        <div className="space-y-3">
          <div className="gradient-primary text-white px-4 py-3 rounded-xl text-sm font-medium">
            .gradient-primary — bg-gradient-to-r from-primary to-primary/70
          </div>
          <p className="gradient-text text-xl font-semibold">
            .gradient-text — gradient text
          </p>
        </div>

        <SectionLabel>Glow effects</SectionLabel>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="glow-primary h-14 w-14 rounded-xl bg-primary" />
            <span className="text-xs text-muted-foreground mt-1 block">glow-primary</span>
          </div>
          <div className="text-center">
            <div className="glow-primary-lg h-14 w-14 rounded-xl bg-primary" />
            <span className="text-xs text-muted-foreground mt-1 block">glow-primary-lg</span>
          </div>
        </div>

        <SectionLabel>Animations</SectionLabel>
        <div className="flex flex-wrap gap-4">
          <code className="text-xs bg-muted px-2 py-1 rounded">.animate-fade-in</code>
          <code className="text-xs bg-muted px-2 py-1 rounded">.animate-slide-up</code>
          <code className="text-xs bg-muted px-2 py-1 rounded">.animate-scale-in</code>
        </div>

        <SectionLabel>Brand Assets</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
            <img src="/brand/logo-hubfy-dark.svg" alt="Logo Dark" className="h-8" />
            <span className="text-xs text-muted-foreground">logo-hubfy-dark</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4 bg-foreground">
            <img src="/brand/logo-hubfy-light.svg" alt="Logo Light" className="h-8" />
            <span className="text-xs text-white/70">logo-hubfy-light</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
            <img src="/brand/icon-hubfy-dark.svg" alt="Icon Dark" className="h-8" />
            <span className="text-xs text-muted-foreground">icon-hubfy-dark</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4 bg-foreground">
            <img src="/brand/icon-hubfy-light.svg" alt="Icon Light" className="h-8" />
            <span className="text-xs text-white/70">icon-hubfy-light</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LAYOUT
   ═══════════════════════════════════════════════════════════ */

export default function AdminBrandGuide() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeSection = (section as Section) || "brand";

  useEffect(() => {
    document.title = `${sectionLabels[activeSection] || "Style Guide"} — Hubfy`;
  }, [activeSection]);

  // Scroll to component sub-item when navigating via sidebar
  useEffect(() => {
    const item = searchParams.get("s");
    if (item && activeSection === "components") {
      setTimeout(() => {
        const el = document.getElementById(item);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams, activeSection]);

  const isActive = (s: Section) => activeSection === s;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-hubfy-dark.svg" alt="Hubfy" className="h-6" />
            <h6 className="text-base font-semibold">Style Guide</h6>
            <Badge variant="secondary">v1.0</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/admin/signup">Create account</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden md:block w-52 shrink-0 border-r sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {/* Brand */}
            <Link
              to="/styleguide/brand"
              className={`block w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                isActive("brand") ? "font-medium text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Brand
            </Link>

            {/* Typography */}
            <Link
              to="/styleguide/typography"
              className={`block w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                isActive("typography") ? "font-medium text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Typography
            </Link>

            {/* Colors */}
            <Link
              to="/styleguide/colors"
              className={`block w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                isActive("colors") ? "font-medium text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Colors
            </Link>

            {/* Components (collapsible, default open) */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <button
                  className={`flex w-full items-center justify-between text-sm px-2 py-1.5 rounded-md transition-colors ${
                    isActive("components") ? "font-medium text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={(e) => {
                    // Navigate on click but also toggle
                    if (!isActive("components")) {
                      e.preventDefault();
                      navigate("/styleguide/components");
                    }
                  }}
                >
                  Components
                  <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-2 mt-1 space-y-0.5 border-l border-border pl-2">
                  {componentItems.map((item) => (
                    <Link
                      key={item}
                      to={`/styleguide/components?s=${encodeURIComponent(item)}`}
                      className="block text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Utilities */}
            <Link
              to="/styleguide/utilities"
              className={`block w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                isActive("utilities") ? "font-medium text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Utilities
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-4xl mx-auto px-6 py-10">
            {activeSection === "brand" && <BrandContent />}
            {activeSection === "typography" && <TypographyContent />}
            {activeSection === "colors" && <ColorsContent />}
            {activeSection === "components" && <ComponentsContent />}
            {activeSection === "utilities" && <UtilitiesContent />}
          </main>
        </div>
      </div>
    </div>
  );
}
