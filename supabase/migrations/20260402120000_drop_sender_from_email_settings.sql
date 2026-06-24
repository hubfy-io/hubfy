-- Drop sender columns from tenant_email_settings
-- These fields are now stored per-broadcast in email_broadcasts table
ALTER TABLE tenant_email_settings
  DROP COLUMN IF EXISTS from_name,
  DROP COLUMN IF EXISTS from_email,
  DROP COLUMN IF EXISTS reply_to;
