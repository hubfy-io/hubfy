-- Add subject column to delivery_emails for persistent history
ALTER TABLE public.delivery_emails ADD COLUMN IF NOT EXISTS subject TEXT;
