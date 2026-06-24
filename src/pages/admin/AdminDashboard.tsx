import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import DashboardKPICards from "@/components/admin/dashboard/DashboardKPICards";
import DashboardRevenueChart from "@/components/admin/dashboard/DashboardRevenueChart";
import DashboardPaymentChart from "@/components/admin/dashboard/DashboardPaymentChart";
import DashboardRecentSales from "@/components/admin/dashboard/DashboardRecentSales";
import DashboardTopProducts from "@/components/admin/dashboard/DashboardTopProducts";
import DashboardOnboarding from "@/components/admin/dashboard/DashboardOnboarding";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { metrics, loading } = useDashboardMetrics();

  return (
    <div className="h-full min-w-0 overflow-hidden p-4 sm:p-6 lg:p-10">
      <div className="mx-auto flex h-full min-w-0 max-w-[1200px] 3xl:max-w-[1600px] flex-col space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-title">
            {t("dashboard.greeting", { name: profile?.name?.split(" ")[0] || t("dashboard.roles.tenant") })}
          </h1>
        </div>

        {/* KPI Cards */}
        <DashboardKPICards metrics={metrics} loading={loading} />

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <DashboardRevenueChart data={metrics?.revenueByDay ?? []} loading={loading} />
          <DashboardPaymentChart data={metrics?.revenueByPaymentMethod ?? []} loading={loading} />
        </div>

        {/* Recent Sales + Top Products */}
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardRecentSales data={metrics?.recentSales ?? []} loading={loading} />
          <DashboardTopProducts data={metrics?.topProducts ?? []} loading={loading} />
        </div>

        {/* Onboarding */}
        <DashboardOnboarding onboarding={metrics?.onboarding} loading={loading} />
      </div>
    </div>
  );
}
