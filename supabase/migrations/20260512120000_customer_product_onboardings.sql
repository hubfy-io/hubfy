-- ============================================================
-- Customer product onboardings
-- - One active onboarding per tenant
-- - Active onboarding can be linked to multiple products
-- - Customer must answer it before accessing linked products
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customer_onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'inactive')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(questions) = 'array'),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_onboardings_one_active
  ON public.customer_onboardings (tenant_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_customer_onboardings_tenant_status
  ON public.customer_onboardings (tenant_id, status);

DROP TRIGGER IF EXISTS set_customer_onboardings_updated_at ON public.customer_onboardings;
CREATE TRIGGER set_customer_onboardings_updated_at
  BEFORE UPDATE ON public.customer_onboardings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.onboarding_products (
  onboarding_id UUID NOT NULL REFERENCES public.customer_onboardings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (onboarding_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_products_tenant
  ON public.onboarding_products (tenant_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_products_product
  ON public.onboarding_products (product_id);

CREATE OR REPLACE FUNCTION public.validate_onboarding_product_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_onboarding_tenant UUID;
  v_product_tenant UUID;
BEGIN
  SELECT tenant_id INTO v_onboarding_tenant
  FROM public.customer_onboardings
  WHERE id = NEW.onboarding_id;

  SELECT tenant_id INTO v_product_tenant
  FROM public.products
  WHERE id = NEW.product_id;

  IF v_onboarding_tenant IS NULL OR v_product_tenant IS NULL THEN
    RAISE EXCEPTION 'Onboarding or product not found';
  END IF;

  IF NEW.tenant_id <> v_onboarding_tenant OR NEW.tenant_id <> v_product_tenant THEN
    RAISE EXCEPTION 'Onboarding and product must belong to the same tenant';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_onboarding_product_tenant ON public.onboarding_products;
CREATE TRIGGER validate_onboarding_product_tenant
  BEFORE INSERT OR UPDATE ON public.onboarding_products
  FOR EACH ROW EXECUTE FUNCTION public.validate_onboarding_product_tenant();

CREATE TABLE IF NOT EXISTS public.customer_onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  onboarding_id UUID NOT NULL REFERENCES public.customer_onboardings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(answers) = 'object'),
  question_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(question_snapshot) = 'array'),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (onboarding_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_onboarding_responses_tenant
  ON public.customer_onboarding_responses (tenant_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_onboarding_responses_customer
  ON public.customer_onboarding_responses (customer_id, completed_at DESC);

DROP TRIGGER IF EXISTS set_customer_onboarding_responses_updated_at ON public.customer_onboarding_responses;
CREATE TRIGGER set_customer_onboarding_responses_updated_at
  BEFORE UPDATE ON public.customer_onboarding_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.customer_onboardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_onboarding_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant editors can manage customer onboardings" ON public.customer_onboardings;
CREATE POLICY "Tenant editors can manage customer onboardings"
  ON public.customer_onboardings
  FOR ALL
  USING (public.is_tenant_editor(tenant_id) OR public.is_admin())
  WITH CHECK (public.is_tenant_editor(tenant_id) OR public.is_admin());

DROP POLICY IF EXISTS "Tenant editors can manage onboarding products" ON public.onboarding_products;
CREATE POLICY "Tenant editors can manage onboarding products"
  ON public.onboarding_products
  FOR ALL
  USING (public.is_tenant_editor(tenant_id) OR public.is_admin())
  WITH CHECK (public.is_tenant_editor(tenant_id) OR public.is_admin());

DROP POLICY IF EXISTS "Tenant editors can view onboarding responses" ON public.customer_onboarding_responses;
CREATE POLICY "Tenant editors can view onboarding responses"
  ON public.customer_onboarding_responses
  FOR SELECT
  USING (
    public.is_tenant_editor(tenant_id)
    OR public.is_admin()
    OR user_id = auth.uid()
  );

-- Returns the active onboarding still required by the authenticated customer.
-- No rows means there is no blocking onboarding for this tenant/user.
CREATE OR REPLACE FUNCTION public.get_required_customer_onboarding(p_tenant_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  questions JSONB,
  product_ids UUID[],
  completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  SELECT c.id INTO v_customer_id
  FROM public.customers c
  WHERE c.tenant_id = p_tenant_id
    AND c.user_id = auth.uid()
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.title,
    o.description,
    o.questions,
    array_agg(DISTINCT op.product_id) AS product_ids,
    r.completed_at
  FROM public.customer_onboardings o
  JOIN public.onboarding_products op
    ON op.onboarding_id = o.id
   AND op.tenant_id = o.tenant_id
  JOIN public.orders ord
    ON ord.product_id = op.product_id
   AND ord.customer_id = v_customer_id
   AND ord.tenant_id = o.tenant_id
   AND ord.status = 'completed'
  LEFT JOIN public.customer_onboarding_responses r
    ON r.onboarding_id = o.id
   AND r.customer_id = v_customer_id
  WHERE o.tenant_id = p_tenant_id
    AND o.status = 'active'
    AND r.id IS NULL
  GROUP BY o.id, o.title, o.description, o.questions, r.completed_at
  ORDER BY o.activated_at DESC NULLS LAST, o.created_at DESC
  LIMIT 1;
END;
$$;

-- Customer submission. This is intentionally narrow: only the authenticated
-- customer with a completed order for a linked product can submit.
CREATE OR REPLACE FUNCTION public.submit_customer_onboarding_response(
  p_onboarding_id UUID,
  p_answers JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_onboarding public.customer_onboardings%ROWTYPE;
  v_customer public.customers%ROWTYPE;
  v_has_access BOOLEAN;
  v_response_id UUID;
BEGIN
  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'answers must be a JSON object';
  END IF;

  SELECT * INTO v_onboarding
  FROM public.customer_onboardings
  WHERE id = p_onboarding_id
    AND status = 'active';

  IF v_onboarding.id IS NULL THEN
    RAISE EXCEPTION 'Active onboarding not found';
  END IF;

  SELECT * INTO v_customer
  FROM public.customers
  WHERE tenant_id = v_onboarding.tenant_id
    AND user_id = auth.uid()
  LIMIT 1;

  IF v_customer.id IS NULL THEN
    RAISE EXCEPTION 'Customer not found for this tenant';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.onboarding_products op
    JOIN public.orders ord
      ON ord.product_id = op.product_id
     AND ord.customer_id = v_customer.id
     AND ord.tenant_id = op.tenant_id
     AND ord.status = 'completed'
    WHERE op.onboarding_id = v_onboarding.id
      AND op.tenant_id = v_onboarding.tenant_id
  ) INTO v_has_access;

  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Customer does not have access to a product linked to this onboarding';
  END IF;

  INSERT INTO public.customer_onboarding_responses (
    tenant_id,
    onboarding_id,
    customer_id,
    user_id,
    answers,
    question_snapshot,
    completed_at
  )
  VALUES (
    v_onboarding.tenant_id,
    v_onboarding.id,
    v_customer.id,
    auth.uid(),
    p_answers,
    v_onboarding.questions,
    now()
  )
  ON CONFLICT (onboarding_id, customer_id)
  DO UPDATE SET
    answers = EXCLUDED.answers,
    question_snapshot = EXCLUDED.question_snapshot,
    completed_at = now(),
    updated_at = now()
  RETURNING id INTO v_response_id;

  RETURN v_response_id;
END;
$$;
