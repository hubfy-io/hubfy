-- Add Zoop seller fields to tenants for payment gateway integration
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS zoop_seller_id text,
  ADD COLUMN IF NOT EXISTS zoop_seller_status text NOT NULL DEFAULT 'none'
    CHECK (zoop_seller_status IN ('none','pending','documents_submitted','approved','ready','denied')),
  ADD COLUMN IF NOT EXISTS zoop_seller_type text
    CHECK (zoop_seller_type IN ('individual','business')),
  ADD COLUMN IF NOT EXISTS zoop_bank_account_id text;

COMMENT ON COLUMN public.tenants.zoop_seller_id IS 'Zoop seller ID for this tenant';
COMMENT ON COLUMN public.tenants.zoop_seller_status IS 'Seller KYC status: none → pending → documents_submitted → approved → ready | denied';
COMMENT ON COLUMN public.tenants.zoop_seller_type IS 'individual (CPF) or business (CNPJ)';
COMMENT ON COLUMN public.tenants.zoop_bank_account_id IS 'Zoop bank account ID linked to the seller';

-- Index for webhook lookups by seller_id
CREATE INDEX IF NOT EXISTS idx_tenants_zoop_seller_id
  ON public.tenants(zoop_seller_id) WHERE zoop_seller_id IS NOT NULL;
