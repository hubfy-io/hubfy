import { Navigate, useParams, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantBySlug } from "@/hooks/useTenantBySlug";
import { useRequiredCustomerOnboarding } from "@/hooks/useRequiredCustomerOnboarding";

interface CourseShowcaseRouteProps {
  children: React.ReactNode;
}

export function CourseShowcaseRoute({ children }: CourseShowcaseRouteProps) {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { user, loading } = useAuth();
  const location = useLocation();
  const tenantQuery = useTenantBySlug(user ? tenantSlug : undefined);
  const {
    data: requiredOnboarding,
    isLoading: onboardingLoading,
  } = useRequiredCustomerOnboarding(
    tenantQuery.data?.id,
    Boolean(user && tenantQuery.data?.id),
  );

  if (loading || tenantQuery.isLoading || onboardingLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/${tenantSlug}/login`}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (requiredOnboarding) {
    return (
      <Navigate
        to={`/${tenantSlug}/onboarding`}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
