import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type {
  CustomerOnboardingAnswers,
  CustomerOnboardingQuestion,
} from "@/types/customer-onboarding";

export interface RequiredCustomerOnboarding {
  id: string;
  title: string;
  description: string | null;
  questions: CustomerOnboardingQuestion[];
  product_ids: string[];
  completed_at: string | null;
}

export function useRequiredCustomerOnboarding(
  tenantId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["required-customer-onboarding", tenantId],
    enabled: enabled && !!tenantId,
    staleTime: 10_000,
    queryFn: async (): Promise<RequiredCustomerOnboarding | null> => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .rpc("get_required_customer_onboarding", { p_tenant_id: tenantId })
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        questions: (data.questions as unknown as CustomerOnboardingQuestion[]) ?? [],
      };
    },
  });
}

export function useSubmitRequiredCustomerOnboarding(tenantId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      onboardingId,
      answers,
    }: {
      onboardingId: string;
      answers: CustomerOnboardingAnswers;
    }) => {
      const { error } = await supabase.rpc("submit_customer_onboarding_response", {
        p_onboarding_id: onboardingId,
        p_answers: answers as Json,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["required-customer-onboarding", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["portal-products-hero", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["portal-purchased-products"] });
    },
  });
}
