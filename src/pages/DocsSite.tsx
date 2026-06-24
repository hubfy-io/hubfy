import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  Menu,
  Rocket,
  Sparkles,
  Terminal,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/auth/ThemeSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/utils";
import {
  getApiReferenceData,
  type ApiEndpoint,
  type ApiParam,
  type ApiResponse,
  type ApiReferenceBundle,
} from "@/features/docs/api-reference-data";

/* ───────────────────────── URL helpers ───────────────────────── */

const DOCS_HOST = "docs.hubfy.io";

function isDocsHost() {
  return typeof window !== "undefined" && window.location.hostname === DOCS_HOST;
}

function getDocsBasePath() {
  return isDocsHost() ? "" : "/docs";
}

function stripTrailingSlash(path: string) {
  if (path === "/") return path;
  return path.replace(/\/+$/, "") || "/";
}

function normalizeDocsPath(pathname: string) {
  const safe = stripTrailingSlash(pathname || "/");
  if (safe === "/docs") return "/";
  if (safe.startsWith("/docs/")) {
    const nested = safe.slice("/docs".length);
    return nested || "/";
  }
  return safe || "/";
}

function toDocsHref(path: string) {
  const normalized = normalizeDocsPath(path || "/");
  const base = getDocsBasePath();
  if (normalized === "/") return base || "/";
  return `${base}${normalized}`;
}

/* ─────────────────── Syntax highlight helpers ─────────────────── */

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type Part = { type: "string" | "other"; value: string };

// Splits the input around string literals so keyword/number highlight only
// runs on non-string regions. Avoids regex cross-contamination between the
// HTML emitted by earlier replacements and later passes.
function splitByStrings(source: string, stringRegex: RegExp): Part[] {
  const parts: Part[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  stringRegex.lastIndex = 0;
  while ((match = stringRegex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "other", value: source.slice(lastIndex, match.index) });
    }
    parts.push({ type: "string", value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < source.length) {
    parts.push({ type: "other", value: source.slice(lastIndex) });
  }
  return parts;
}

function highlightJson(json: string): string {
  const escaped = escapeHtml(json);
  const parts = splitByStrings(
    escaped,
    /"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"/g,
  );

  return parts
    .map((part, idx) => {
      if (part.type === "string") {
        const next = parts[idx + 1];
        const isKey = next?.type === "other" && /^\s*:/.test(next.value);
        const cls = isKey ? "text-sky-300" : "text-emerald-300";
        return `<span class="${cls}">${part.value}</span>`;
      }
      // Single-pass regex so a later rule can't match digits inside an
      // earlier rule's <span class="text-*"> attribute value.
      return part.value.replace(
        /\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?)/g,
        (_m, bool, nul, num) => {
          if (bool) return `<span class="text-purple-300">${bool}</span>`;
          if (nul) return `<span class="text-zinc-500">${nul}</span>`;
          if (num) return `<span class="text-amber-300">${num}</span>`;
          return _m;
        },
      );
    })
    .join("");
}

function highlightCurl(curl: string): string {
  const escaped = escapeHtml(curl);
  const parts = splitByStrings(escaped, /"[^"]*"/g);

  return parts
    .map((part) => {
      if (part.type === "string") {
        return `<span class="text-emerald-300">${part.value}</span>`;
      }
      return part.value
        .replace(/\b(curl|-X|-H|-d|--data|--header)\b/g, '<span class="text-purple-300">$1</span>')
        .replace(/\b(GET|POST|PATCH|DELETE|PUT)\b/g, '<span class="text-amber-300 font-semibold">$1</span>')
        .replace(/(https?:\/\/[^\s]+)/g, '<span class="text-sky-300">$1</span>');
    })
    .join("");
}

/* ───────────────────────── Page title ─────────────────────────── */

const pageTitles: Record<string, string> = {
  "/": "Hubfy API · Developer docs",
  "/introduction": "Introduction · Hubfy API",
  "/authentication": "Authentication · Hubfy API",
  "/quickstart": "Quickstart · Hubfy API",
  "/api": "API Reference · Hubfy API",
};

function useDocsPageTitle(path: string, endpointSummary?: string) {
  const title = endpointSummary
    ? `${endpointSummary} · Hubfy API`
    : pageTitles[path] || "Hubfy API";
  usePageTitle(title);
}

/* ──────────────────────── Code block UI ───────────────────────── */

function DarkCodeBlock({
  code,
  highlight,
  title,
  lineNumbers = false,
}: {
  code: string;
  highlight?: "json" | "curl";
  title?: string;
  lineNumbers?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    if (highlight === "json") return highlightJson(code);
    if (highlight === "curl") return highlightCurl(code);
    return escapeHtml(code);
  }, [code, highlight]);

  const lines = code.split("\n");

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-sm">
      {title ? (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {title}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-zinc-200"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
      <pre className="relative overflow-x-auto p-4 text-zinc-100">
        {!title ? (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1 text-xs text-zinc-400 transition hover:text-zinc-200"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        ) : null}
        <code
          className="font-mono text-[13px] leading-relaxed"
          dangerouslySetInnerHTML={
            lineNumbers
              ? {
                  __html: lines
                    .map(
                      (_line, idx) =>
                        `<span class="inline-block w-8 select-none text-zinc-600">${idx + 1}</span>`,
                    )
                    .join("\n") +
                    "\n" +
                    html,
                }
              : { __html: html }
          }
        />
      </pre>
    </div>
  );
}

/* ──────────────────────── Security badge ──────────────────────── */

function SecurityBadge({ security }: { security: ApiEndpoint["security"] }) {
  if (security === "none") {
    return <Badge variant="outline">Public</Badge>;
  }
  return (
    <Badge variant="outline" className="gap-1">
      <KeyRound className="h-3 w-3" />
      Bearer token
    </Badge>
  );
}

/* ──────────────── HTTP method pill ──────────────── */

const methodColor: Record<string, string> = {
  GET: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  POST: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PATCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DELETE: "bg-destructive/10 text-destructive",
  PUT: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function MethodPill({ method }: { method: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        methodColor[method] ?? "bg-muted text-muted-foreground",
      )}
    >
      {method}
    </span>
  );
}

/* ───────────────────────── curl sample ────────────────────────── */

function placeholderValue(type: string): unknown {
  if (type === "integer" || type === "number") return 0;
  if (type === "boolean") return true;
  return "string";
}

function generateCurlSample(ep: ApiEndpoint, apiBaseUrl: string): string {
  const base = apiBaseUrl.replace(/\/$/, "");
  const url = `${base}${ep.path.replace(/\{(\w+)\}/g, (_m, name) => {
    if (name === "id") {
      if (ep.path.includes("/customers")) return "cust_f3a8b9c1d4e2";
      if (ep.path.includes("/products")) return "prod_9f20e7a3b8c1";
      if (ep.path.includes("/orders")) return "ordr_1a2b3c4d5e6f";
    }
    return `{${name}}`;
  })}`;

  const lines: string[] = [];
  const method = ep.method;

  if (method === "GET") {
    lines.push(`curl ${url} \\`);
    lines.push(`  -H "Authorization: Bearer sk_live_..."`);
    return lines.join("\n");
  }

  lines.push(`curl -X ${method} ${url} \\`);
  lines.push(`  -H "Authorization: Bearer sk_live_..." \\`);

  if (ep.requestBody?.properties.length) {
    lines.push(`  -H "Content-Type: application/json" \\`);
    const sample: Record<string, unknown> = {};
    for (const prop of ep.requestBody.properties) {
      if (!prop.required) continue;
      sample[prop.name] =
        prop.format === "email"
          ? "user@example.com"
          : prop.format === "date-time"
          ? "2026-01-01T00:00:00Z"
          : prop.enum?.[0] ?? placeholderValue(prop.type);
    }
    if (Object.keys(sample).length === 0 && ep.requestBody.properties[0]) {
      const first = ep.requestBody.properties[0];
      sample[first.name] = first.enum?.[0] ?? placeholderValue(first.type);
    }
    lines.push(`  -d '${JSON.stringify(sample)}'`);
  } else {
    // trim trailing backslash
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s\\$/, "");
  }

  return lines.join("\n");
}

/* ─────────────────── Params + responses tables ─────────────────── */

function ApiParamsTable({ params }: { params: ApiParam[] }) {
  if (!params.length) {
    return (
      <p className="text-support italic text-muted-foreground">No parameters.</p>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Field</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {params.map((param) => (
            <TableRow key={param.name}>
              <TableCell className="align-top font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span>{param.name}</span>
                  {param.required ? (
                    <span className="text-destructive text-[10px]">required</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top text-xs text-muted-foreground">
                {param.type}
                {param.format ? (
                  <span className="ml-1 opacity-70">({param.format})</span>
                ) : null}
              </TableCell>
              <TableCell className="align-top text-sm">
                {param.description ? (
                  <p className="whitespace-pre-line">{param.description}</p>
                ) : null}
                {param.enum?.length ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    One of:{" "}
                    {param.enum.map((v) => (
                      <code
                        key={v}
                        className="mx-0.5 rounded bg-muted px-1 text-[11px]"
                      >
                        {v}
                      </code>
                    ))}
                  </p>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = /^2/.test(status)
    ? "bg-success/15 text-success"
    : /^4/.test(status)
      ? "bg-warning/15 text-warning"
      : /^5/.test(status)
        ? "bg-destructive/15 text-destructive"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold",
        color,
      )}
    >
      {status}
    </span>
  );
}

function ResponsePanel({ responses }: { responses: ApiResponse[] }) {
  if (!responses.length) return null;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {responses.map((r) => (
        <li key={r.status} className="flex items-start gap-3 p-3">
          <StatusPill status={r.status} />
          <p className="text-sm text-muted-foreground">
            {r.description || "—"}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ResponseCodeBox({ responses }: { responses: ApiResponse[] }) {
  const withExample = responses.filter((r) => r.example);
  const fallbackStatus = withExample[0]?.status ?? "";
  const [active, setActive] = useState(fallbackStatus);
  const [copied, setCopied] = useState(false);

  const activeResponse =
    withExample.find((r) => r.status === active) ?? withExample[0];
  const code = activeResponse?.example ?? "";
  const html = useMemo(() => highlightJson(code), [code]);

  if (!withExample.length) return null;

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-sm">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900/60 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Response
          </span>
          {withExample.map((r) => {
            const isActive = r.status === activeResponse!.status;
            const isSuccess = /^2/.test(r.status);
            const isServerError = /^5/.test(r.status);
            const activeColor = isSuccess
              ? "bg-emerald-500/15 text-emerald-300"
              : isServerError
                ? "bg-rose-500/15 text-rose-300"
                : "bg-amber-500/15 text-amber-300";
            return (
              <button
                key={r.status}
                type="button"
                onClick={() => setActive(r.status)}
                className={cn(
                  "rounded-md px-2 py-0.5 font-mono text-[11px] transition",
                  isActive
                    ? activeColor
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {r.status}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs text-zinc-400 transition hover:text-zinc-200"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-zinc-100">
        <code
          className="font-mono text-[13px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}

/* ─────────────────────────── Sidebar ──────────────────────────── */

type SidebarItem = { label: string; href: string; external?: boolean };
type SidebarGroup = { label: string; items: SidebarItem[] };

function buildSidebar(bundle: ApiReferenceBundle): SidebarGroup[] {
  const groups: SidebarGroup[] = [
    {
      label: "Getting started",
      items: [
        { label: "Introduction", href: "/" },
        { label: "Authentication", href: "/authentication" },
        { label: "Quickstart", href: "/quickstart" },
      ],
    },
    {
      label: "API Reference",
      items: [{ label: "Overview", href: "/api" }],
    },
  ];

  for (const tag of bundle.apiTags) {
    groups.push({
      label: tag.name,
      items: tag.endpoints.map((ep) => ({
        label: ep.summary || ep.operationId,
        href: `/api/${ep.operationId}`,
      })),
    });
  }

  return groups;
}

function DocsSidebarNav({
  currentPath,
  groups,
  onNavigate,
}: {
  currentPath: string;
  groups: SidebarGroup[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-6 text-sm">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="text-label px-3 text-muted-foreground">{group.label}</p>
          <div className="flex flex-col">
            {group.items.map((item) => {
              const href = toDocsHref(item.href);
              const normalized = normalizeDocsPath(currentPath);
              const isActive =
                normalized === item.href ||
                (item.href !== "/" && normalized.startsWith(item.href));
              return (
                <NavLink
                  key={item.href}
                  to={href}
                  onClick={onNavigate}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition hover:bg-muted",
                    isActive && "bg-muted font-medium text-foreground",
                  )}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/* ──────────────────────────── Header ──────────────────────────── */

function DocsHeader({
  sidebar,
  currentPath,
}: {
  sidebar: SidebarGroup[];
  currentPath: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto">
              <DocsSidebarNav
                currentPath={currentPath}
                groups={sidebar}
                onNavigate={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <Link
            to={toDocsHref("/")}
            className="flex items-center gap-2 font-semibold"
          >
            <img
              src="/brand/icon-hubfy-dark.svg"
              alt="Hubfy"
              className="h-6 w-6 dark:block hidden"
            />
            <img
              src="/brand/icon-hubfy-light.svg"
              alt="Hubfy"
              className="h-6 w-6 dark:hidden"
            />
            <span className="text-sm">
              Hubfy <span className="text-muted-foreground">· Docs</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://hubfy.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            hubfy.io
          </a>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────── Pages ────────────────────────────── */

function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        {eyebrow ? (
          <p className="text-label uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-title">{title}</h1>
        {subtitle ? (
          <p className="text-body text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-section">{title}</h2>
      {children}
    </section>
  );
}

function IntroductionPage() {
  const bundle = getApiReferenceData();
  useDocsPageTitle("/");

  const quickCurl = `curl ${bundle.apiBaseUrl}/v1/customers \\
  -H "Authorization: Bearer sk_live_..."`;

  return (
    <PageShell
      eyebrow="Hubfy REST API"
      title="Build on the Hubfy platform"
      subtitle="A resource-oriented REST API to manage customers, products, and orders in your workspace — from a CRM sync, a migration script, or a custom integration."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Resource-oriented</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Predictable URLs, standard verbs (GET, POST, PATCH, DELETE), JSON
              everywhere.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <KeyRound className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Bearer-token auth</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              One <code className="text-xs">sk_live_*</code> key per workspace.
              Create and revoke from the dashboard.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Rocket className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Idempotent writes</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Order imports accept <code className="text-xs">Idempotency-Key</code>{" "}
              so retries never duplicate records.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Section title="Base URL">
        <p className="text-body text-muted-foreground">
          Every request is sent to:
        </p>
        <DarkCodeBlock code={bundle.apiBaseUrl} />
      </Section>

      <Section title="A first request">
        <p className="text-body text-muted-foreground">
          Once you have an API key, listing customers is a single call:
        </p>
        <DarkCodeBlock code={quickCurl} highlight="curl" />
      </Section>

      <Section title="What's next">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to={toDocsHref("/authentication")}
            className="group rounded-lg border p-4 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <p className="text-section mb-1">Authentication →</p>
            <p className="text-support text-muted-foreground">
              How to create an API key and send it with every request.
            </p>
          </Link>
          <Link
            to={toDocsHref("/quickstart")}
            className="group rounded-lg border p-4 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <p className="text-section mb-1">Quickstart →</p>
            <p className="text-support text-muted-foreground">
              Create a customer, a product and an order in three curl commands.
            </p>
          </Link>
          <Link
            to={toDocsHref("/api")}
            className="group rounded-lg border p-4 transition hover:border-foreground/40 hover:bg-muted/40 sm:col-span-2"
          >
            <p className="text-section mb-1">API Reference →</p>
            <p className="text-support text-muted-foreground">
              Full list of endpoints with request and response schemas.
            </p>
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}

function AuthenticationPage() {
  useDocsPageTitle("/authentication");
  const bundle = getApiReferenceData();
  const badExample = `401 Unauthorized
{
  "error": {
    "code": "invalid_api_key",
    "message": "Invalid API key"
  }
}`;

  return (
    <PageShell
      eyebrow="Authentication"
      title="API keys & Bearer tokens"
      subtitle="Every request must carry a Bearer token. API keys are the simplest way to talk to the Hubfy API."
    >
      <Section title="1. Create a key">
        <p className="text-body text-muted-foreground">
          In your workspace dashboard, open{" "}
          <strong>Settings → API Keys</strong>. Click <em>Create key</em>, give
          it a label and copy the generated <code className="text-xs">sk_live_*</code>{" "}
          token. You will see the full token only once — store it somewhere safe.
        </p>
      </Section>

      <Section title="2. Send it with every request">
        <p className="text-body text-muted-foreground">
          Add an <code className="text-xs">Authorization</code> header with the
          scheme <code className="text-xs">Bearer</code>:
        </p>
        <DarkCodeBlock
          code={`curl ${bundle.apiBaseUrl}/v1/customers \\
  -H "Authorization: Bearer sk_live_..."`}
          highlight="curl"
        />
      </Section>

      <Section title="Tenant resolution">
        <p className="text-body text-muted-foreground">
          The workspace is resolved from the key itself — you never pass a
          workspace id. Each key only works for the workspace in which it was
          created.
        </p>
      </Section>

      <Section title="Revoking a key">
        <p className="text-body text-muted-foreground">
          Back in <strong>Settings → API Keys</strong>, any key can be revoked
          instantly. Revoked keys return <code className="text-xs">401</code>{" "}
          on the next request.
        </p>
      </Section>

      <Section title="Error responses">
        <p className="text-body text-muted-foreground">
          Missing or invalid auth returns a structured error:
        </p>
        <DarkCodeBlock code={badExample} highlight="json" />
      </Section>
    </PageShell>
  );
}

function QuickstartPage() {
  useDocsPageTitle("/quickstart");
  const bundle = getApiReferenceData();
  const base = bundle.apiBaseUrl;

  const createCustomer = `curl -X POST ${base}/v1/customers \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"email":"maria@example.com","name":"Maria Silva"}'`;

  const customerResponse = `{
  "id": "cust_f3a8b9c1d4e2",
  "email": "maria@example.com",
  "name": "Maria Silva",
  "created_at": "2026-04-19T12:00:00Z"
}`;

  const createProduct = `curl -X POST ${base}/v1/products \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Pro plan","unit_amount":19900,"currency":"BRL","status":"active"}'`;

  const productResponse = `{
  "id": "prod_9f20e7a3b8c1",
  "name": "Pro plan",
  "status": "active",
  "unit_amount": 19900,
  "currency": "BRL"
}`;

  const createOrder = `curl -X POST ${base}/v1/orders \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{"customer_id":"cust_f3a8b9c1d4e2","product_id":"prod_9f20e7a3b8c1","unit_amount":19900}'`;

  const orderResponse = `{
  "id": "ordr_1a2b3c4d5e6f",
  "status": "completed",
  "source": "custom",
  "unit_amount": 19900,
  "currency": "BRL",
  "customer": { "id": "cust_f3a8b9c1d4e2", "name": "Maria Silva" },
  "product":  { "id": "prod_9f20e7a3b8c1", "name": "Pro plan" }
}`;

  return (
    <PageShell
      eyebrow="Quickstart"
      title="Your first integration in 3 calls"
      subtitle="Create a customer, a product and a completed order — enough to wire up a CRM sync or an ERP importer."
    >
      <Section title="Prerequisite">
        <p className="text-body text-muted-foreground">
          Grab an API key from{" "}
          <Link
            to={toDocsHref("/authentication")}
            className="underline underline-offset-2"
          >
            Authentication
          </Link>{" "}
          before running the commands below.
        </p>
      </Section>

      <Section title="1. Create a customer">
        <DarkCodeBlock code={createCustomer} highlight="curl" title="Request" />
        <DarkCodeBlock
          code={customerResponse}
          highlight="json"
          title="201 Created"
        />
      </Section>

      <Section title="2. Create a product">
        <DarkCodeBlock code={createProduct} highlight="curl" title="Request" />
        <DarkCodeBlock
          code={productResponse}
          highlight="json"
          title="201 Created"
        />
      </Section>

      <Section title="3. Record the order">
        <p className="text-body text-muted-foreground">
          The <code className="text-xs">Idempotency-Key</code> header makes
          retries safe — the same key always returns the same order.
        </p>
        <DarkCodeBlock code={createOrder} highlight="curl" title="Request" />
        <DarkCodeBlock code={orderResponse} highlight="json" title="201 Created" />
      </Section>

      <Section title="Next steps">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to={toDocsHref("/api")}
            className="rounded-lg border p-4 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <p className="text-section mb-1">Browse the API Reference →</p>
            <p className="text-support text-muted-foreground">
              Every endpoint, parameter and response schema.
            </p>
          </Link>
          <Link
            to={toDocsHref("/authentication")}
            className="rounded-lg border p-4 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <p className="text-section mb-1">Manage API keys →</p>
            <p className="text-support text-muted-foreground">
              How keys are scoped, how to revoke, how to rotate.
            </p>
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}

/* ───────────────────── API Reference pages ───────────────────── */

function ApiReferenceOverview() {
  useDocsPageTitle("/api");
  const bundle = getApiReferenceData();

  return (
    <PageShell
      eyebrow="API Reference"
      title={bundle.apiInfo.title}
      subtitle={`Version ${bundle.apiInfo.version}. Base URL: ${bundle.apiBaseUrl}`}
    >
      <div className="space-y-10">
        {bundle.apiTags.map((tag) => (
          <section key={tag.name} className="space-y-4">
            <div>
              <h2 className="text-section">{tag.name}</h2>
              {tag.description ? (
                <p className="text-body text-muted-foreground">
                  {tag.description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col divide-y rounded-lg border">
              {tag.endpoints.map((ep) => (
                <Link
                  key={ep.operationId}
                  to={toDocsHref(`/api/${ep.operationId}`)}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/60"
                >
                  <MethodPill method={ep.method} />
                  <span className="flex-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {ep.path}
                    </span>
                    {ep.summary ? (
                      <span className="ml-3 text-sm">{ep.summary}</span>
                    ) : null}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function ApiEndpointPage({
  operationId,
  onNotFound,
}: {
  operationId: string;
  onNotFound: () => void;
}) {
  const bundle = getApiReferenceData();
  const match = bundle.findEndpointById(operationId);

  useDocsPageTitle(`/api/${operationId}`, match?.endpoint.summary);

  useEffect(() => {
    if (!match) onNotFound();
  }, [match, onNotFound]);

  if (!match) return null;
  const { endpoint } = match;

  const successResponses = endpoint.responses.filter((r) => /^2/.test(r.status));
  const errorResponses = endpoint.responses.filter((r) => !/^2/.test(r.status));

  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-label uppercase tracking-wider text-muted-foreground">
            {match.tagName}
          </p>
          <h1 className="text-title">{endpoint.summary || endpoint.operationId}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <MethodPill method={endpoint.method} />
            <code className="text-sm font-mono text-muted-foreground">
              {endpoint.path}
            </code>
            <SecurityBadge security={endpoint.security} />
          </div>
          {endpoint.description ? (
            <p className="text-body whitespace-pre-line text-muted-foreground">
              {endpoint.description}
            </p>
          ) : null}
        </header>

        {endpoint.requestBody?.properties.length ? (
          <section className="space-y-3">
            <h2 className="text-section">Request body</h2>
            <ApiParamsTable params={endpoint.requestBody.properties} />
          </section>
        ) : null}

        {successResponses.length ? (
          <section className="space-y-3">
            <h2 className="text-section">Success responses</h2>
            <ResponsePanel responses={successResponses} />
          </section>
        ) : null}

        {errorResponses.length ? (
          <section className="space-y-3">
            <h2 className="text-section">Error responses</h2>
            <ResponsePanel responses={errorResponses} />
          </section>
        ) : null}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <DarkCodeBlock
          code={generateCurlSample(endpoint, bundle.apiBaseUrl)}
          highlight="curl"
          title="Sample request"
        />
        <ResponseCodeBox responses={endpoint.responses} />
      </aside>
    </article>
  );
}

function NotFoundPage() {
  useDocsPageTitle("/");
  return (
    <PageShell
      eyebrow="404"
      title="Page not found"
      subtitle="The documentation page you were looking for doesn't exist or has moved."
    >
      <Link to={toDocsHref("/")} className="inline-flex">
        <Button variant="outline">Back to Introduction</Button>
      </Link>
    </PageShell>
  );
}

/* ─────────────────────────── Routing ──────────────────────────── */

type ResolvedRoute =
  | { type: "introduction" }
  | { type: "authentication" }
  | { type: "quickstart" }
  | { type: "api_overview" }
  | { type: "api_endpoint"; operationId: string }
  | { type: "not_found" };

function resolveRoute(path: string): ResolvedRoute {
  if (path === "/" || path === "/introduction") return { type: "introduction" };
  if (path === "/authentication") return { type: "authentication" };
  if (path === "/quickstart") return { type: "quickstart" };
  if (path === "/api") return { type: "api_overview" };
  if (path.startsWith("/api/")) {
    const operationId = path.slice("/api/".length);
    return { type: "api_endpoint", operationId };
  }
  return { type: "not_found" };
}

/* ──────────────────────────── Root ────────────────────────────── */

export default function DocsSite() {
  const location = useLocation();
  const navigate = useNavigate();
  const normalizedPath = normalizeDocsPath(location.pathname);
  const route = resolveRoute(normalizedPath);

  const bundle = getApiReferenceData();
  const sidebar = useMemo(() => buildSidebar(bundle), [bundle]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DocsHeader sidebar={sidebar} currentPath={location.pathname} />
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <DocsSidebarNav
              currentPath={location.pathname}
              groups={sidebar}
            />
          </div>
        </aside>
        <main className="min-w-0">
          {route.type === "introduction" ? <IntroductionPage /> : null}
          {route.type === "authentication" ? <AuthenticationPage /> : null}
          {route.type === "quickstart" ? <QuickstartPage /> : null}
          {route.type === "api_overview" ? <ApiReferenceOverview /> : null}
          {route.type === "api_endpoint" ? (
            <ApiEndpointPage
              operationId={route.operationId}
              onNotFound={() => navigate(toDocsHref("/api"), { replace: true })}
            />
          ) : null}
          {route.type === "not_found" ? <NotFoundPage /> : null}

          <Separator className="my-10" />
          <footer className="flex flex-col gap-2 text-support text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              <Terminal className="mr-1.5 inline h-3.5 w-3.5" />
              Hubfy · {new Date().getFullYear()}
            </span>
            <div className="flex gap-4">
              <Link to={toDocsHref("/")} className="hover:text-foreground">
                Introduction
              </Link>
              <Link to={toDocsHref("/api")} className="hover:text-foreground">
                API Reference
              </Link>
              <a
                href="https://hubfy.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                hubfy.io
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
