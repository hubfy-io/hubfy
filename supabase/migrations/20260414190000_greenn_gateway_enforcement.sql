-- ============================================================
-- Greenn Gateway Enforcement
--
-- Inclui Greenn na regra de "1 gateway de pagamento ativo por
-- tenant" e registra a credencial obrigatória (webhook_token) em
-- integration_credential_rules para que a validação backend
-- seja aplicada igual aos outros providers.
--
-- Contexto: as migrations originais do Universal Gateway
-- (20260403100000 e 20260403500000) hardcoded a lista
-- ('hotmart','kiwify','kirvano','lastlink') tanto no índice
-- parcial quanto na função enforce_single_active_gateway.
-- Sem esta migration, Greenn ficaria fora da exclusividade e
-- poderia coexistir com outro gateway de pagamento ativo.
-- ============================================================

-- ─── 1. Credential rule para Greenn ─────────────────────────
INSERT INTO public.integration_credential_rules (provider, required_keys)
VALUES ('greenn', ARRAY['webhook_token'])
ON CONFLICT (provider) DO NOTHING;

-- ─── 2. Índice parcial: incluir greenn ──────────────────────
DROP INDEX IF EXISTS public.idx_one_active_payment_gateway;

CREATE UNIQUE INDEX idx_one_active_payment_gateway
  ON public.tenant_integrations (tenant_id)
  WHERE status = 'active'
    AND provider IN ('hotmart', 'kiwify', 'kirvano', 'lastlink', 'greenn');

-- ─── 3. Trigger: incluir greenn no array payment_providers ──
CREATE OR REPLACE FUNCTION public.enforce_single_active_gateway()
RETURNS TRIGGER AS $$
DECLARE
  payment_providers TEXT[] := ARRAY['hotmart','kiwify','kirvano','lastlink','greenn'];
BEGIN
  -- Só aplica para providers de pagamento
  IF NOT (NEW.provider = ANY(payment_providers)) THEN
    RETURN NEW;
  END IF;

  -- Se está ativando, desativa os outros gateways do tenant
  IF NEW.status = 'active' THEN
    UPDATE public.tenant_integrations
    SET status = 'inactive', updated_at = now()
    WHERE tenant_id = NEW.tenant_id
      AND provider = ANY(payment_providers)
      AND provider != NEW.provider
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
