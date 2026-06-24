-- ============================================================
-- delivery_emails: tracks file delivery emails sent to customers
-- after checkout for products with benefit = 'files'
-- ============================================================

-- 1. ENUM
DO $$ BEGIN
  CREATE TYPE public.delivery_email_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TABLE
CREATE TABLE IF NOT EXISTS public.delivery_emails (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  status             public.delivery_email_status NOT NULL DEFAULT 'pending',
  resend_message_id  TEXT,
  error_message      TEXT,

  sent_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_delivery_emails_order    ON public.delivery_emails(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_emails_tenant   ON public.delivery_emails(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_emails_customer ON public.delivery_emails(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_emails_status   ON public.delivery_emails(tenant_id, status);

-- 4. TRIGGER (updated_at)
CREATE TRIGGER set_delivery_emails_updated_at
  BEFORE UPDATE ON public.delivery_emails
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. RLS
ALTER TABLE public.delivery_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors can manage delivery_emails"
  ON public.delivery_emails FOR ALL
  USING (public.is_tenant_editor(tenant_id) OR public.is_admin());

CREATE POLICY "Customers can view own delivery_emails"
  ON public.delivery_emails FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );
