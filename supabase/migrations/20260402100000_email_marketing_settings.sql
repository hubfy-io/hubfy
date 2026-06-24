-- ============================================================
-- Email Marketing: tenant_email_settings
-- Config de domínio, remetente, Resend segment/topic e anti-spam
-- ============================================================

CREATE TABLE public.tenant_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Domínio de envio
  resend_domain_id TEXT,
  domain TEXT,
  domain_status TEXT NOT NULL DEFAULT 'not_configured',
  dns_records JSONB DEFAULT '[]',

  -- Resend topic (1 por tenant, pra isolamento de unsubscribe)
  resend_topic_id TEXT,

  -- Remetente
  from_name TEXT,
  from_email TEXT,
  reply_to TEXT,

  -- Controle
  enabled BOOLEAN NOT NULL DEFAULT false,
  suspended BOOLEAN NOT NULL DEFAULT false,
  suspended_reason TEXT,
  max_recipients_per_broadcast INTEGER NOT NULL DEFAULT 200,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id)
);

ALTER TABLE public.tenant_email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors can manage email settings"
  ON public.tenant_email_settings FOR ALL
  USING (public.is_tenant_editor(tenant_id) OR public.is_admin());

CREATE INDEX idx_tenant_email_settings_tenant
  ON public.tenant_email_settings(tenant_id);

CREATE TRIGGER set_tenant_email_settings_updated_at
  BEFORE UPDATE ON public.tenant_email_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
