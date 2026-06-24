-- ============================================================
-- Refactor ActiveCampaign sync trigger to use vault secrets
--
-- Previously, trigger_activecampaign_sync() had the Supabase URL
-- and anon key hardcoded in the function body. This was the only
-- trigger that didn't use the vault pattern, causing issues when
-- the Supabase domain changes (e.g. moving to custom domain).
--
-- Now it reads `supabase_url` and `supabase_anon_key` from the
-- vault, matching the pattern established in
-- 20260319400000_seller_async_provider_flow.sql.
--
-- Updating the vault secret once propagates to this trigger
-- and all other pg_net triggers automatically.
-- ============================================================

CREATE OR REPLACE FUNCTION public.trigger_activecampaign_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_has_integration BOOLEAN;
  _supabase_url TEXT;
  _anon_key TEXT;
BEGIN
  -- Only sync if tenant has an active AC integration
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_integrations
    WHERE tenant_id = NEW.tenant_id
      AND provider = 'activecampaign'
      AND status = 'active'
  ) INTO v_has_integration;

  IF NOT v_has_integration THEN
    RETURN NEW;
  END IF;

  -- Get secrets from vault
  SELECT decrypted_secret INTO _supabase_url
    FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1;
  SELECT decrypted_secret INTO _anon_key
    FROM vault.decrypted_secrets WHERE name = 'supabase_anon_key' LIMIT 1;

  IF _supabase_url IS NULL OR _anon_key IS NULL THEN
    RAISE WARNING 'Vault secrets supabase_url/supabase_anon_key not found — skipping activecampaign sync';
    RETURN NEW;
  END IF;

  -- Fire-and-forget HTTP call via pg_net (non-blocking)
  PERFORM net.http_post(
    url     := _supabase_url || '/functions/v1/activecampaign-sync-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey',       _anon_key
    ),
    body    := jsonb_build_object(
      'tenant_id', NEW.tenant_id::text,
      'email',     NEW.email,
      'name',      NEW.name,
      'tags',      '[]'::jsonb
    )
  );

  RETURN NEW;
END;
$$;

-- Trigger already exists from the original migration
-- (on_customer_created_sync_activecampaign), no need to recreate.
-- CREATE OR REPLACE FUNCTION above is enough — the trigger will
-- automatically use the new function body.

-- ============================================================
-- Update vault secret `supabase_url` to the custom domain.
-- This is the single source of truth that ALL pg_net triggers
-- read from (seller-provider-submit, asset-cleanup-orphans,
-- activecampaign-sync-contact, etc.).
-- Idempotent: setting same value twice is a no-op.
-- ============================================================
DO $$
DECLARE
  _secret_id uuid;
BEGIN
  SELECT id INTO _secret_id FROM vault.secrets WHERE name = 'supabase_url' LIMIT 1;

  IF _secret_id IS NOT NULL THEN
    PERFORM vault.update_secret(_secret_id, 'https://api.hubfy.io');
  ELSE
    PERFORM vault.create_secret(
      'https://api.hubfy.io',
      'supabase_url',
      'Supabase project URL for pg_net triggers'
    );
  END IF;
END;
$$;
