import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/hooks/useTenant";
import type { Database, Json } from "@/integrations/supabase/types";
import type {
  CustomerOnboardingQuestion,
  CustomerOnboardingStatus,
} from "@/types/customer-onboarding";

type OnboardingRow = Database["public"]["Tables"]["customer_onboardings"]["Row"];

export interface CustomerOnboarding extends Omit<OnboardingRow, "questions"> {
  productIds: string[];
  responsesCount: number;
  questions: CustomerOnboardingQuestion[];
}

export interface OnboardingProductOption {
  id: string;
  name: string;
  status: Database["public"]["Enums"]["product_status"];
}

export interface CustomerOnboardingResponse {
  id: string;
  completed_at: string;
  answers: Record<string, unknown>;
  question_snapshot: CustomerOnboardingQuestion[];
  customer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface SaveOnboardingInput {
  id?: string;
  title: string;
  description?: string | null;
  questions: CustomerOnboardingQuestion[];
  productIds: string[];
}

interface RawOnboarding extends OnboardingRow {
  onboarding_products?: { product_id: string }[] | null;
  customer_onboarding_responses?: { id: string }[] | null;
}

interface RawResponse {
  id: string;
  completed_at: string;
  answers: Json;
  question_snapshot: Json;
  customers: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

const listKey = (tenantId?: string | null) => ["customer-onboardings", tenantId] as const;

function normalizeQuestions(questions: CustomerOnboardingQuestion[]) {
  return questions.map((question) => ({
    ...question,
    label: question.label.trim(),
    description: question.description?.trim() || "",
    image_url: question.image_url || "",
    options: (question.options ?? []).map((option) => ({
      ...option,
      label: option.label.trim(),
    })),
  }));
}

export function useCustomerOnboardings() {
  const { tenant } = useTenant();
  const tenantId = tenant?.id ?? null;

  return useQuery({
    queryKey: listKey(tenantId),
    enabled: !!tenantId,
    staleTime: 15_000,
    queryFn: async (): Promise<CustomerOnboarding[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("customer_onboardings")
        .select("*, onboarding_products(product_id), customer_onboarding_responses(id)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data ?? []) as RawOnboarding[]).map((item) => ({
        ...item,
        questions: (item.questions as unknown as CustomerOnboardingQuestion[]) ?? [],
        productIds: item.onboarding_products?.map((link) => link.product_id) ?? [],
        responsesCount: item.customer_onboarding_responses?.length ?? 0,
      }));
    },
  });
}

export function useOnboardingProductOptions() {
  const { tenant } = useTenant();
  const tenantId = tenant?.id ?? null;

  return useQuery({
    queryKey: ["onboarding-product-options", tenantId],
    enabled: !!tenantId,
    staleTime: 30_000,
    queryFn: async (): Promise<OnboardingProductOption[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("products")
        .select("id, name, status")
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as OnboardingProductOption[];
    },
  });
}

export function useOnboardingResponses(onboardingId: string | null) {
  return useQuery({
    queryKey: ["customer-onboarding-responses", onboardingId],
    enabled: !!onboardingId,
    staleTime: 15_000,
    queryFn: async (): Promise<CustomerOnboardingResponse[]> => {
      if (!onboardingId) return [];

      const { data, error } = await supabase
        .from("customer_onboarding_responses")
        .select("id, completed_at, answers, question_snapshot, customers(id, name, email)")
        .eq("onboarding_id", onboardingId)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      return ((data ?? []) as RawResponse[]).map((response) => ({
        id: response.id,
        completed_at: response.completed_at,
        answers: (response.answers as Record<string, unknown>) ?? {},
        question_snapshot:
          (response.question_snapshot as unknown as CustomerOnboardingQuestion[]) ?? [],
        customer: response.customers,
      }));
    },
  });
}

export function useSaveCustomerOnboarding() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id ?? null;

  return useMutation({
    mutationFn: async (input: SaveOnboardingInput) => {
      if (!tenantId) throw new Error("Tenant não encontrado.");

      const questions = normalizeQuestions(input.questions);
      const payload = {
        tenant_id: tenantId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        questions: questions as unknown as Json,
        created_by: user?.id ?? null,
      };

      let onboardingId = input.id;

      if (onboardingId) {
        const { error } = await supabase
          .from("customer_onboardings")
          .update({
            title: payload.title,
            description: payload.description,
            questions: payload.questions,
          })
          .eq("id", onboardingId)
          .eq("tenant_id", tenantId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("customer_onboardings")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;
        onboardingId = data.id;
      }

      const { error: deleteError } = await supabase
        .from("onboarding_products")
        .delete()
        .eq("onboarding_id", onboardingId);

      if (deleteError) throw deleteError;

      if (input.productIds.length > 0) {
        const { error: insertLinksError } = await supabase
          .from("onboarding_products")
          .insert(
            input.productIds.map((productId) => ({
              onboarding_id: onboardingId!,
              tenant_id: tenantId,
              product_id: productId,
            })),
          );

        if (insertLinksError) throw insertLinksError;
      }

      return onboardingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey(tenantId) });
      queryClient.invalidateQueries({ queryKey: ["customer-onboarding-responses"] });
      queryClient.invalidateQueries({ queryKey: ["required-customer-onboarding"] });
    },
  });
}

export function useSetCustomerOnboardingStatus() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id ?? null;

  return useMutation({
    mutationFn: async ({
      onboardingId,
      status,
    }: {
      onboardingId: string;
      status: CustomerOnboardingStatus;
    }) => {
      if (!tenantId) throw new Error("Tenant não encontrado.");

      if (status === "active") {
        const { error: deactivateError } = await supabase
          .from("customer_onboardings")
          .update({ status: "inactive", activated_at: null })
          .eq("tenant_id", tenantId)
          .eq("status", "active")
          .neq("id", onboardingId);

        if (deactivateError) throw deactivateError;
      }

      const { error } = await supabase
        .from("customer_onboardings")
        .update({
          status,
          activated_at: status === "active" ? new Date().toISOString() : null,
        })
        .eq("id", onboardingId)
        .eq("tenant_id", tenantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey(tenantId) });
      queryClient.invalidateQueries({ queryKey: ["required-customer-onboarding"] });
    },
  });
}
