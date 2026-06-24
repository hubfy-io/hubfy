import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  GraduationCap,
  Mail,
  CreditCard,
  Settings,
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  Lock,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/* ═══════════════════════════════════════════════════
   Shared mini-sidebar used by Feature Tabs + Dashboard
   ═══════════════════════════════════════════════════ */

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: ShoppingCart, label: "Orders" },
  { icon: Users, label: "Customers" },
  { icon: Package, label: "Products" },
  { icon: GraduationCap, label: "Courses" },
  { icon: Mail, label: "Email" },
  { icon: CreditCard, label: "Checkouts" },
  { icon: Settings, label: "Settings" },
];

function MiniSidebar({ active }: { active: string }) {
  return (
    <div className="hidden w-[130px] shrink-0 flex-col gap-2.5 border-r border-border/40 pr-3 sm:flex">
      <div className="flex items-center gap-2 px-2 pb-1">
        <img src="/brand/icon-hubfy-dark.svg" alt="" className="h-4 w-4 dark:hidden" />
        <img src="/brand/icon-hubfy-light.svg" alt="" className="hidden h-4 w-4 dark:block" />
        <span className="text-[10px] font-semibold truncate">Sydney's Academy</span>
      </div>
      <Separator className="mb-0.5" />
      <div className="space-y-0.5">
        {sidebarItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded-md px-2 py-1 text-[10px] ${
              item.label === active
                ? "bg-primary/10 font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Browser chrome wrapper (simplified inline version)
   ═══════════════════════════════════════════════════ */

function MockBrowser({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border/40 bg-muted/40 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <div className="size-2 rounded-full bg-red-400" />
          <div className="size-2 rounded-full bg-yellow-400" />
          <div className="size-2 rounded-full bg-green-400" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-[200px] rounded-md border border-border/60 bg-background px-2 py-0.5 text-center text-[9px] text-muted-foreground truncate">
            {url}
          </div>
        </div>
        <div className="w-[34px]" />
      </div>
      {/* Content */}
      <div className="bg-background text-foreground">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Mini KPI Card
   ═══════════════════════════════════════════════════ */

function MiniKPI({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`rounded-md p-1 ${iconBg}`}>
          <Icon className={`size-2.5 ${iconColor}`} />
        </div>
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FEATURE TAB MOCKUPS (5 tabs)
   ═══════════════════════════════════════════════════ */

/* ─── Courses Tab ─── */
const coursesData = [
  { title: "The Complete Sales Playbook", status: "Active", modules: 8, lessons: 24, img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=80&fit=crop&q=80" },
  { title: "Leadership Fundamentals", status: "Active", modules: 5, lessons: 15, img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=80&fit=crop&q=80" },
  { title: "Growth Marketing 101", status: "Draft", modules: 3, lessons: 9, img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=80&fit=crop&q=80" },
];

function CoursesMockup() {
  return (
    <MockBrowser url="app.hubfy.io/admin/courses">
      <div className="flex">
        <MiniSidebar active="Courses" />
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold">Courses</h4>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-20 items-center rounded-md border border-border/60 bg-muted/30 px-1.5">
                <Search className="size-2.5 text-muted-foreground" />
                <span className="ml-1 text-[8px] text-muted-foreground">Search...</span>
              </div>
              <div className="flex h-5 items-center gap-0.5 rounded-md bg-primary px-1.5 text-[8px] font-medium text-primary-foreground">
                <Plus className="size-2" />
                New
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {coursesData.map((c) => (
              <div key={c.title} className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card p-2 hover:border-foreground/10 transition-colors">
                <img src={c.img} alt="" className="h-7 w-[84px] shrink-0 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate">{c.title}</p>
                  <p className="text-[8px] text-muted-foreground">{c.modules} modules · {c.lessons} lessons</p>
                </div>
                <Badge variant={c.status === "Active" ? "success" : "outline"} className="text-[7px] px-1.5 py-0 h-4 hidden sm:flex">
                  {c.status}
                </Badge>
                <button className="text-muted-foreground">
                  <MoreHorizontal className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

/* ─── Coaching Tab (Orders view) ─── */
const ordersData = [
  { customer: "Sarah Mitchell", initials: "SM", product: "1:1 Strategy Call", amount: "$297", status: "Approved" as const },
  { customer: "Alex Kim", initials: "AK", product: "Group Coaching — Q2", amount: "$497", status: "Approved" as const },
  { customer: "Jordan Brooks", initials: "JB", product: "Executive Coaching", amount: "$1,200", status: "Pending" as const },
  { customer: "Mia Rodriguez", initials: "MR", product: "1:1 Strategy Call", amount: "$297", status: "Approved" as const },
];

function CoachingMockup() {
  return (
    <MockBrowser url="app.hubfy.io/admin/orders">
      <div className="flex">
        <MiniSidebar active="Orders" />
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold">Orders</h4>
            <div className="flex h-5 w-20 items-center rounded-md border border-border/60 bg-muted/30 px-1.5">
              <Search className="size-2.5 text-muted-foreground" />
              <span className="ml-1 text-[8px] text-muted-foreground">Search...</span>
            </div>
          </div>
          {/* Mini KPIs */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <MiniKPI label="Revenue" value="$14,820" icon={DollarSign} iconBg="bg-warning/10" iconColor="text-warning" />
            <MiniKPI label="Orders" value="48" icon={ShoppingCart} iconBg="bg-primary/10" iconColor="text-primary" />
            <MiniKPI label="Growth" value="+24%" icon={ArrowUpRight} iconBg="bg-success/10" iconColor="text-success" />
          </div>
          {/* Table */}
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-x-2 bg-muted/30 px-2.5 py-1.5 text-[8px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Customer</span>
              <span>Product</span>
              <span className="hidden sm:block">Amount</span>
              <span>Status</span>
            </div>
            {ordersData.map((o) => (
              <div key={o.customer} className="grid grid-cols-[1fr_1fr_auto_auto] gap-x-2 items-center border-t border-border/40 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="size-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-semibold text-primary">
                    {o.initials}
                  </div>
                  <span className="text-[9px] font-medium truncate">{o.customer}</span>
                </div>
                <span className="text-[9px] text-muted-foreground truncate">{o.product}</span>
                <span className="text-[9px] font-medium hidden sm:block">{o.amount}</span>
                <Badge
                  variant={o.status === "Approved" ? "green" : "amber"}
                  className="text-[7px] px-1.5 py-0 h-4"
                >
                  {o.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

/* ─── Communities Tab (Customers view) ─── */
const customersData = [
  { name: "Sarah Mitchell", email: "sarah@email.com", initials: "SM", status: "Subscribed" },
  { name: "Alex Kim", email: "alex.k@email.com", initials: "AK", status: "Subscribed" },
  { name: "Jordan Brooks", email: "jordan.b@email.com", initials: "JB", status: "Unsubscribed" },
  { name: "Mia Rodriguez", email: "mia.r@email.com", initials: "MR", status: "Subscribed" },
  { name: "Daniel Foster", email: "daniel.f@email.com", initials: "DF", status: "Subscribed" },
];

function CommunityMockup() {
  return (
    <MockBrowser url="app.hubfy.io/admin/customers">
      <div className="flex">
        <MiniSidebar active="Customers" />
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold">Customers</h4>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-20 items-center rounded-md border border-border/60 bg-muted/30 px-1.5">
                <Search className="size-2.5 text-muted-foreground" />
                <span className="ml-1 text-[8px] text-muted-foreground">Search...</span>
              </div>
              <div className="flex h-5 items-center gap-0.5 rounded-md bg-primary px-1.5 text-[8px] font-medium text-primary-foreground">
                <Plus className="size-2" />
                Add
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-x-2 bg-muted/30 px-2.5 py-1.5 text-[8px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Customer</span>
              <span className="hidden sm:block">Email</span>
              <span>Status</span>
            </div>
            {customersData.map((c) => (
              <div key={c.name} className="grid grid-cols-[1fr_1fr_auto] gap-x-2 items-center border-t border-border/40 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="size-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-semibold text-primary">
                    {c.initials}
                  </div>
                  <span className="text-[9px] font-medium truncate">{c.name}</span>
                </div>
                <span className="text-[9px] text-muted-foreground truncate hidden sm:block">{c.email}</span>
                <Badge
                  variant={c.status === "Subscribed" ? "success" : "secondary"}
                  className="text-[7px] px-1.5 py-0 h-4"
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

/* ─── Membership Tab (Dashboard KPIs + Chart) ─── */
const membershipChartData = [
  { month: "Jul", revenue: 8200 },
  { month: "Aug", revenue: 9100 },
  { month: "Sep", revenue: 9800 },
  { month: "Oct", revenue: 10600 },
  { month: "Nov", revenue: 11400 },
  { month: "Dec", revenue: 12480 },
];

function MembershipMockup() {
  return (
    <MockBrowser url="app.hubfy.io/admin">
      <div className="flex">
        <MiniSidebar active="Dashboard" />
        <div className="flex-1 p-3">
          <div className="mb-3">
            <p className="text-[9px] text-muted-foreground">Dashboard</p>
            <p className="text-xs font-semibold">Welcome back, Sydney</p>
          </div>
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <MiniKPI label="MRR" value="$12,480" icon={DollarSign} iconBg="bg-warning/10" iconColor="text-warning" />
            <MiniKPI label="Members" value="1,248" icon={Users} iconBg="bg-primary/10" iconColor="text-primary" />
            <MiniKPI label="Growth" value="+12%" icon={ArrowUpRight} iconBg="bg-success/10" iconColor="text-success" />
          </div>
          {/* Chart */}
          <div className="rounded-lg border border-border/60 p-2.5">
            <p className="text-[9px] font-medium text-foreground mb-2">Recurring Revenue</p>
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membershipChartData} margin={{ top: 2, right: 2, bottom: 0, left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={8} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} fontSize={7} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

/* ─── Downloads Tab (Products view) ─── */
const productsData = [
  { name: "Brand Strategy Template", price: "$29", orders: 342, status: "Published", img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=80&h=80&fit=crop&q=80" },
  { name: "Content Calendar Kit", price: "$19", orders: 218, status: "Published", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&h=80&fit=crop&q=80" },
  { name: "Financial Planner PDF", price: "$39", orders: 156, status: "Published", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=80&h=80&fit=crop&q=80" },
  { name: "Social Media Bundle", price: "$49", orders: 0, status: "Draft", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=80&h=80&fit=crop&q=80" },
];

function DownloadsMockup() {
  return (
    <MockBrowser url="app.hubfy.io/admin/products">
      <div className="flex">
        <MiniSidebar active="Products" />
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold">Products</h4>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-20 items-center rounded-md border border-border/60 bg-muted/30 px-1.5">
                <Search className="size-2.5 text-muted-foreground" />
                <span className="ml-1 text-[8px] text-muted-foreground">Search...</span>
              </div>
              <div className="flex h-5 items-center gap-0.5 rounded-md bg-primary px-1.5 text-[8px] font-medium text-primary-foreground">
                <Plus className="size-2" />
                New
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 bg-muted/30 px-2.5 py-1.5 text-[8px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Product</span>
              <span className="hidden sm:block">Price</span>
              <span className="hidden sm:block">Orders</span>
              <span>Status</span>
            </div>
            {productsData.map((p) => (
              <div key={p.name} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-center border-t border-border/40 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <img src={p.img} alt="" className="size-6 shrink-0 rounded-md object-cover" />
                  <span className="text-[9px] font-medium truncate">{p.name}</span>
                </div>
                <span className="text-[9px] font-medium hidden sm:block">{p.price}</span>
                <span className="text-[9px] text-muted-foreground hidden sm:block">{p.orders}</span>
                <Badge
                  variant={p.status === "Published" ? "green" : "outline"}
                  className="text-[7px] px-1.5 py-0 h-4"
                >
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

/* ═══════════════════════════════════════════════════
   Feature tab dispatcher
   ═══════════════════════════════════════════════════ */

export function FeatureMockup({ type }: { type: string }) {
  switch (type) {
    case "course":
      return <CoursesMockup />;
    case "coaching":
      return <CoachingMockup />;
    case "community":
      return <CommunityMockup />;
    case "membership":
      return <MembershipMockup />;
    case "download":
      return <DownloadsMockup />;
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════
   SECTION 2 — Dashboard Mockup ("Operating System")
   ═══════════════════════════════════════════════════ */

const dashboardChartData = [
  { day: "Mon", revenue: 3200 },
  { day: "Tue", revenue: 4100 },
  { day: "Wed", revenue: 2800 },
  { day: "Thu", revenue: 5400 },
  { day: "Fri", revenue: 4800 },
  { day: "Sat", revenue: 3100 },
  { day: "Sun", revenue: 6200 },
];

const recentSales = [
  { name: "Sarah Mitchell", initials: "SM", product: "Complete Sales Playbook", amount: "$297", date: "2 min ago" },
  { name: "Alex Kim", initials: "AK", product: "Executive Coaching", amount: "$497", date: "18 min ago" },
  { name: "Luna Santos", initials: "LS", product: "Brand Strategy Template", amount: "$29", date: "1h ago" },
  { name: "Daniel Foster", initials: "DF", product: "Leadership Fundamentals", amount: "$197", date: "3h ago" },
];

const topProducts = [
  { name: "Complete Sales Playbook", revenue: 12420, sales: 42 },
  { name: "Executive Coaching", revenue: 8940, sales: 18 },
  { name: "Brand Strategy Template", revenue: 4640, sales: 160 },
  { name: "Leadership Fundamentals", revenue: 3940, sales: 20 },
];

export function DashboardMockup() {
  const maxRevenue = Math.max(...topProducts.map((p) => p.revenue));

  return (
    <MockBrowser url="app.hubfy.io/admin">
      <div className="flex">
        <MiniSidebar active="Dashboard" />
        <div className="flex-1 p-3 sm:p-4">
          <div className="mb-3">
            <p className="text-[9px] text-muted-foreground sm:text-[10px]">Dashboard</p>
            <p className="text-xs font-semibold sm:text-sm">Welcome back, Sydney</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-1.5 mb-3 sm:grid-cols-4 sm:gap-2">
            <MiniKPI label="Total Revenue" value="$186,420" icon={DollarSign} iconBg="bg-warning/10" iconColor="text-warning" />
            <MiniKPI label="Orders" value="1,847" icon={ShoppingCart} iconBg="bg-primary/10" iconColor="text-primary" />
            <MiniKPI label="This Month" value="$24,580" icon={TrendingUp} iconBg="bg-success/10" iconColor="text-success" />
            <MiniKPI label="Growth" value="+18.2%" icon={ArrowUpRight} iconBg="bg-success/10" iconColor="text-success" />
          </div>

          {/* Charts + Sales row */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {/* Revenue Chart */}
            <div className="rounded-lg border border-border/60 p-2.5">
              <p className="text-[9px] font-medium text-foreground mb-2 sm:text-[10px]">Revenue Over Time</p>
              <div className="h-[90px] w-full sm:h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardChartData} margin={{ top: 2, right: 2, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={8} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tickLine={false} axisLine={false} fontSize={7} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="rounded-lg border border-border/60 p-2.5">
              <p className="text-[9px] font-medium text-foreground mb-2 sm:text-[10px]">Recent Sales</p>
              <div className="space-y-2">
                {recentSales.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="size-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-semibold text-primary sm:size-6">
                      {s.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-medium truncate">{s.name}</p>
                      <p className="text-[7px] text-muted-foreground truncate">{s.product}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-medium">{s.amount}</p>
                      <p className="text-[7px] text-muted-foreground">{s.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="mt-2 rounded-lg border border-border/60 p-2.5">
            <p className="text-[9px] font-medium text-foreground mb-2 sm:text-[10px]">Top Products</p>
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-foreground truncate">{p.name}</span>
                    <span className="text-[9px] font-medium shrink-0">${p.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-[7px] text-muted-foreground shrink-0">{p.sales} sales</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 3 — Checkout Mockup ("Sell with Confidence")
   ═══════════════════════════════════════════════════ */

export function CheckoutMockup() {
  return (
    <MockBrowser url="app.hubfy.io/checkout/executive-coaching">
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {/* Left — Product info */}
          <div>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80" alt="" className="h-28 w-full rounded-lg object-cover mb-3 sm:h-36" />
            <h4 className="text-xs font-semibold sm:text-sm">Executive Coaching Program</h4>
            <p className="text-[9px] text-muted-foreground mt-1 sm:text-[10px]">
              12-week intensive program with 1:1 sessions, action plans, and exclusive resources.
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between rounded-lg border border-foreground/20 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full border-2 border-foreground bg-foreground" />
                  <span className="text-[9px] font-medium">6 Weeks</span>
                </div>
                <span className="text-[9px] font-semibold">$497</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full border-2 border-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">12 Weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-muted-foreground line-through">$994</span>
                  <span className="text-[9px] font-semibold">$897</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Payment form */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-[10px] font-semibold mb-3 sm:text-xs">Payment Details</p>
            <div className="space-y-2">
              <div>
                <label className="text-[8px] font-medium text-muted-foreground mb-0.5 block">Full Name</label>
                <div className="h-6 rounded-md border border-border bg-background px-2 flex items-center">
                  <span className="text-[8px] text-muted-foreground">Sydney Johnson</span>
                </div>
              </div>
              <div>
                <label className="text-[8px] font-medium text-muted-foreground mb-0.5 block">Email</label>
                <div className="h-6 rounded-md border border-border bg-background px-2 flex items-center">
                  <span className="text-[8px] text-muted-foreground">sydney@email.com</span>
                </div>
              </div>
              <div>
                <label className="text-[8px] font-medium text-muted-foreground mb-0.5 block">Card Number</label>
                <div className="h-6 rounded-md border border-border bg-background px-2 flex items-center justify-between">
                  <span className="text-[8px] text-muted-foreground">4242 •••• •••• 4242</span>
                  <div className="flex gap-0.5">
                    <div className="h-3 w-5 rounded-sm bg-blue-600/80" />
                    <div className="h-3 w-5 rounded-sm bg-orange-500/80" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[8px] font-medium text-muted-foreground mb-0.5 block">Expiry</label>
                  <div className="h-6 rounded-md border border-border bg-background px-2 flex items-center">
                    <span className="text-[8px] text-muted-foreground">12/28</span>
                  </div>
                </div>
                <div>
                  <label className="text-[8px] font-medium text-muted-foreground mb-0.5 block">CVC</label>
                  <div className="h-6 rounded-md border border-border bg-background px-2 flex items-center">
                    <span className="text-[8px] text-muted-foreground">•••</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-3 w-full rounded-md bg-primary py-1.5 text-[9px] font-medium text-primary-foreground sm:text-[10px]">
              Complete Purchase — $497
            </button>

            <div className="mt-2 flex items-center justify-center gap-2 text-[7px] text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <Lock className="size-2" />
                SSL Encrypted
              </div>
              <span>·</span>
              <div className="flex items-center gap-0.5">
                <Shield className="size-2" />
                Secure Checkout
              </div>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-[7px] text-muted-foreground">Powered by</span>
              <img src="/brand/icon-hubfy-dark.svg" alt="" className="h-2.5 dark:hidden" />
              <img src="/brand/icon-hubfy-light.svg" alt="" className="hidden h-2.5 dark:block" />
              <span className="text-[7px] font-semibold text-muted-foreground">Hubfy</span>
            </div>
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 4 — Email Broadcasts Mockup ("Funnels")
   ═══════════════════════════════════════════════════ */

const broadcastsData = [
  { subject: "Welcome to the community!", status: "Sent" as const, audience: "2,847", opens: "68%", clicks: "24%", date: "Mar 28" },
  { subject: "New course launch 🚀", status: "Sent" as const, audience: "4,210", opens: "52%", clicks: "18%", date: "Mar 25" },
  { subject: "Weekly insights #24", status: "Draft" as const, audience: "—", opens: "—", clicks: "—", date: "Apr 1" },
  { subject: "Early-bird pricing ends soon", status: "Sent" as const, audience: "3,580", opens: "61%", clicks: "32%", date: "Mar 20" },
];

export function EmailBroadcastsMockup() {
  return (
    <MockBrowser url="app.hubfy.io/admin/email/broadcasts">
      <div className="flex">
        <MiniSidebar active="Email" />
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold">Broadcasts</h4>
            <div className="flex h-5 items-center gap-0.5 rounded-md bg-primary px-1.5 text-[8px] font-medium text-primary-foreground">
              <Plus className="size-2" />
              New Broadcast
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <MiniKPI label="Subscribers" value="8,420" icon={Users} iconBg="bg-primary/10" iconColor="text-primary" />
            <MiniKPI label="Avg. Open Rate" value="42.8%" icon={Eye} iconBg="bg-success/10" iconColor="text-success" />
            <MiniKPI label="Avg. Click Rate" value="12.4%" icon={TrendingUp} iconBg="bg-warning/10" iconColor="text-warning" />
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 bg-muted/30 px-2.5 py-1.5 text-[8px] font-medium text-muted-foreground uppercase tracking-wide">
              <span>Subject</span>
              <span>Status</span>
              <span className="hidden sm:block">Opens</span>
              <span className="hidden sm:block">Audience</span>
            </div>
            {broadcastsData.map((b) => (
              <div key={b.subject} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-center border-t border-border/40 px-2.5 py-1.5">
                <div className="min-w-0">
                  <p className="text-[9px] font-medium truncate">{b.subject}</p>
                  <p className="text-[7px] text-muted-foreground">{b.date}</p>
                </div>
                <Badge
                  variant={b.status === "Sent" ? "default" : "secondary"}
                  className="text-[7px] px-1.5 py-0 h-4"
                >
                  {b.status}
                </Badge>
                <span className="text-[9px] text-muted-foreground hidden sm:block">{b.opens}</span>
                <span className="text-[9px] text-muted-foreground hidden sm:block">{b.audience}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}
