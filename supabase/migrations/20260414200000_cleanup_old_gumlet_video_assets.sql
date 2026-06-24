-- Cleanup: hard-delete video assets that were soft-deleted during the Gumlet
-- account migration (20260413180000_gumlet_account_migration.sql).
-- These records point to gumlet_asset_ids from the old (now inaccessible) account.
-- Safe: already verified zero references in product_assets / lesson_assets_link,
-- and lesson_videos with provider='gumlet' were removed in the prior migration.

DELETE FROM asset_videos
WHERE asset_id IN (
  SELECT id FROM assets
  WHERE type = 'video' AND status = 'deleted'
);

DELETE FROM assets
WHERE type = 'video' AND status = 'deleted';
