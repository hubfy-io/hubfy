-- Cleanup: remove phantom email broadcast drafts created before any real edit
-- Safe scope: only drafts that are fully empty, never updated, and never linked to send state.

DELETE FROM public.email_broadcasts
WHERE status = 'draft'
  AND subject = ''
  AND html = ''
  AND from_name = ''
  AND from_email = ''
  AND reply_to IS NULL
  AND recipient_count = 0
  AND resend_broadcast_id IS NULL
  AND scheduled_at IS NULL
  AND sent_at IS NULL
  AND error_message IS NULL
  AND editor_state IS NULL
  AND segment_filter = '{"type":"all"}'::jsonb
  AND updated_at = created_at;
