-- Active Campaign sync trigger
-- Fires whenever a new customer is inserted into the customers table,
-- regardless of the origin (purchase, manual creation, import, etc).
-- Uses pg_net to call the activecampaign-sync-contact edge function async.
-- The anon key is safe to store here — it's already public in the browser bundle.

CREATE OR REPLACE FUNCTION public.trigger_activecampaign_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_has_integration BOOLEAN;
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

  -- Fire-and-forget HTTP call via pg_net (non-blocking)
  PERFORM net.http_post(
    url     := 'https://xrspiwankdnkqaezfhjt.supabase.co/functions/v1/activecampaign-sync-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey',       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc3Bpd2Fua2Rua3FhZXpmaGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTg4MDAsImV4cCI6MjA4NTg5NDgwMH0.jqNC2ApZsRSZ711mj9AMeE42Fd4xjCyimN0qwPOIa8k'
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

-- Trigger: fires on every new customer, from any source
DROP TRIGGER IF EXISTS on_customer_created_sync_activecampaign ON public.customers;
CREATE TRIGGER on_customer_created_sync_activecampaign
  AFTER INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_activecampaign_sync();
