import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export interface Subscription {
  id: string;
  tenant_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/** Map price IDs to plan names — update after creating products in Stripe Dashboard */
const PLAN_NAMES: Record<string, string> = {
  "price_1T0xxmE0S1igoFfoyTUZcA3b": "Free",
  "price_1T0xNkE0S1igoFfouQ7nKJt1": "Pro",
};

export function useSubscription() {
  const { tenant } = useTenant();
  const tenantId = tenant?.id;

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!tenantId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const isCanceled = subscription?.status === "canceled";
  const willCancel = subscription?.cancel_at_period_end === true;

  const plan = subscription?.stripe_price_id
    ? PLAN_NAMES[subscription.stripe_price_id] || null
    : null;

  return {
    subscription: subscription ?? null,
    isActive,
    isPastDue,
    isCanceled,
    willCancel,
    plan,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
