import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { limitNameLength, limitOptionalNameLength } from "@/lib/name-limits";
import { invalidateCheckouts } from "@/lib/query-invalidation";
import type { Database } from "@/integrations/supabase/types";

type CheckoutStatus = Database["public"]["Enums"]["checkout_status"];

export interface Checkout {
  id: string;
  tenant_id: string;
  product_id: string;
  price_id: string;
  smart_id: string;
  title: string | null;
  description: string | null;
  status: CheckoutStatus;
  collect_phone: boolean;
  collect_address: boolean;
  collect_fiscal_id: boolean;
  allow_discount_codes: boolean;
  expires_at: string | null;
  success_url: string | null;
  cover_url: string | null;
  confirmation_message: string | null;
  total_orders: number;
  created_at: string;
  updated_at: string;
  // joined fields
  product_name: string;
  unit_amount: number;
  currency: string;
}

export interface CreateCheckoutData {
  product_id: string;
  price_id: string;
  title?: string;
  description?: string;
  cover_url?: string;
  collect_phone?: boolean;
  collect_address?: boolean;
  collect_fiscal_id?: boolean;
  allow_discount_codes?: boolean;
  success_url?: string;
  expires_at?: string;
  confirmation_message?: string;
}

export interface UpdateCheckoutData {
  title?: string | null;
  description?: string | null;
  cover_url?: string | null;
  status?: "draft" | "active" | "inactive";
  collect_phone?: boolean;
  collect_address?: boolean;
  collect_fiscal_id?: boolean;
  allow_discount_codes?: boolean;
  success_url?: string | null;
  expires_at?: string | null;
  confirmation_message?: string | null;
}

interface CheckoutRow {
  id: string;
  tenant_id: string;
  product_id: string;
  price_id: string;
  smart_id: string;
  title: string | null;
  description: string | null;
  status: CheckoutStatus;
  collect_phone: boolean;
  collect_address: boolean;
  collect_fiscal_id: boolean;
  allow_discount_codes: boolean;
  expires_at: string | null;
  success_url: string | null;
  cover_url: string | null;
  confirmation_message: string | null;
  total_orders: number;
  created_at: string;
  updated_at: string;
  products: { name: string } | null;
  prices: { unit_amount: number; currency: string } | null;
}

export function useCheckouts(searchQuery = "") {
  const { tenant, loading: tenantLoading } = useTenant();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);

  const tenantId = tenant?.id ?? null;
  const queryKey = ["checkouts", tenantId, searchQuery];

  const fetchCheckouts = useCallback(async (): Promise<Checkout[]> => {
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("checkouts")
      .select("*, products!checkouts_product_id_fkey(name), prices!checkouts_price_id_fkey(unit_amount, currency)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((c: CheckoutRow) => ({
      id: c.id,
      tenant_id: c.tenant_id,
      product_id: c.product_id,
      price_id: c.price_id,
      smart_id: c.smart_id,
      title: limitOptionalNameLength(c.title),
      description: c.description,
      status: c.status,
      collect_phone: c.collect_phone,
      collect_address: c.collect_address,
      collect_fiscal_id: c.collect_fiscal_id,
      allow_discount_codes: c.allow_discount_codes,
      expires_at: c.expires_at,
      success_url: c.success_url,
      cover_url: c.cover_url,
      confirmation_message: c.confirmation_message,
      total_orders: c.total_orders,
      created_at: c.created_at,
      updated_at: c.updated_at,
      product_name: c.products?.name ? limitNameLength(c.products.name) : "",
      unit_amount: c.prices?.unit_amount ?? 0,
      currency: c.prices?.currency ?? "BRL",
    }));
  }, [tenantId]);

  const hasLoadedOnce = useRef(false);

  const {
    data: allCheckouts = [],
    isPending: queryPending,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchCheckouts,
    enabled: !!tenantId,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });

  if (!queryPending && allCheckouts.length >= 0) {
    hasLoadedOnce.current = true;
  }

  const checkouts = searchQuery
    ? allCheckouts.filter(
        (c) =>
          (c.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCheckouts;

  const invalidate = () => {
    invalidateCheckouts(queryClient, tenantId);
  };

  const createCheckout = async (data: CreateCheckoutData) => {
    if (!tenantId) throw new Error("No tenant");
    setActionLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("checkouts")
        .insert({
          tenant_id: tenantId,
          product_id: data.product_id,
          price_id: data.price_id,
          smart_id: "placeholder", // overwritten by DB trigger (auto-generated)
          title: data.title ? limitNameLength(data.title.trim()) : undefined,
          description: data.description,
          cover_url: data.cover_url,
          collect_phone: data.collect_phone ?? false,
          collect_address: data.collect_address ?? false,
          collect_fiscal_id: data.collect_fiscal_id ?? false,
          allow_discount_codes: data.allow_discount_codes ?? false,
          success_url: data.success_url,
          expires_at: data.expires_at,
          confirmation_message: data.confirmation_message,
          status: "active" as const,
        })
        .select()
        .single();

      if (error) throw error;
      invalidate();
      return result;
    } finally {
      setActionLoading(false);
    }
  };

  const updateCheckout = async (checkoutId: string, data: UpdateCheckoutData) => {
    if (!tenantId) throw new Error("No tenant");
    setActionLoading(true);
    try {
      const payload: UpdateCheckoutData = {
        ...data,
        ...(data.title !== undefined
          ? {
              title:
                data.title && data.title.trim()
                  ? limitNameLength(data.title.trim())
                  : null,
            }
          : {}),
      };

      // Atualização otimista — tabela admin reflete a mudança instantaneamente
      queryClient.setQueriesData<Checkout[]>(
        { queryKey: ["checkouts", tenantId] },
        (old) => old?.map((c) => (c.id === checkoutId ? { ...c, ...payload } : c))
      );

      const { error } = await supabase
        .from("checkouts")
        .update(payload)
        .eq("id", checkoutId)
        .eq("tenant_id", tenantId);

      if (error) throw error;
      invalidate();
    } finally {
      setActionLoading(false);
    }
  };

  // Skeleton only on first load; subsequent navigations keep previous data visible
  const loading = tenantLoading || (!!tenantId && queryPending && !hasLoadedOnce.current);

  return {
    checkouts,
    loading,
    actionLoading,
    error: error as Error | null,
    refetch,
    createCheckout,
    updateCheckout,
  };
}
