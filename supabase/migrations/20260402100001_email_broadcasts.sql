-- ============================================================
-- Email Marketing: email_broadcasts
-- Referência local ao broadcast no Resend + metadata
-- Métricas ficam no Resend (GET /broadcasts/:id)
-- ============================================================

CREATE TYPE public.broadcast_status AS ENUM (
  'draft',
  'queued',
  'sending',
  'sent',
  'scheduled',
  'failed',
  'cancelled'
);

CREATE TABLE public.email_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Referência Resend
  resend_broadcast_id TEXT,

  -- Conteúdo (local pra editor + re-edição)
  subject TEXT NOT NULL DEFAULT '',
  from_name TEXT NOT NULL DEFAULT '',
  from_email TEXT NOT NULL DEFAULT '',
  reply_to TEXT,
  html TEXT NOT NULL DEFAULT '',
  editor_state JSONB,

  -- Audiência
  segment_filter JSONB NOT NULL DEFAULT '{"type": "all"}',
  recipient_count INTEGER NOT NULL DEFAULT 0,

  -- Status
  status public.broadcast_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors can manage email broadcasts"
  ON public.email_broadcasts FOR ALL
  USING (public.is_tenant_editor(tenant_id) OR public.is_admin());

CREATE INDEX idx_email_broadcasts_tenant
  ON public.email_broadcasts(tenant_id);
CREATE INDEX idx_email_broadcasts_status
  ON public.email_broadcasts(tenant_id, status);
CREATE INDEX idx_email_broadcasts_resend
  ON public.email_broadcasts(resend_broadcast_id)
  WHERE resend_broadcast_id IS NOT NULL;

CREATE TRIGGER set_email_broadcasts_updated_at
  BEFORE UPDATE ON public.email_broadcasts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
