-- Expand delivery_email_status enum with Resend webhook statuses
ALTER TYPE public.delivery_email_status ADD VALUE IF NOT EXISTS 'delivered';
ALTER TYPE public.delivery_email_status ADD VALUE IF NOT EXISTS 'opened';
ALTER TYPE public.delivery_email_status ADD VALUE IF NOT EXISTS 'clicked';
ALTER TYPE public.delivery_email_status ADD VALUE IF NOT EXISTS 'bounced';
ALTER TYPE public.delivery_email_status ADD VALUE IF NOT EXISTS 'complained';
