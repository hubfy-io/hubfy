-- Migration: Gumlet account migration
-- A conta Gumlet foi trocada. Vídeos antigos foram perdidos.
-- Novos workspaces criados na conta nova via API — mapeados por tenant.public_id.

-- 1. Limpar proteção de vídeo (o secret antigo não é válido na conta nova)
UPDATE tenant_settings
SET gumlet_signed_url_secret = NULL,
    video_protection_enabled = false;

-- 2. Mapear cada tenant para seu novo gumlet_workspace_id na conta nova
UPDATE tenant_settings ts
SET gumlet_workspace_id = m.new_workspace_id
FROM (
  VALUES
    ('hub_270fe4e74a94', '69de801cdbd80813257b4c58'),  -- Agente Lucrativo
    ('hub_abe5b9507fee', '69de801edbd80813257b4cc0'),  -- Alunos
    ('hub_7006ba0e3a81', '69de801f5f90e1f218e00f10'),  -- Henrique Soares
    ('hub_0fd699cfbc4d', '69de80215f90e1f218e00fb6'),  -- Hubfy
    ('hub_6204b3f8b067', '69de8023dbd80813257b4dac'),  -- IA Start
    ('hub_a5fa3e61884f', '69de80255f90e1f218e01057'),  -- LIPO-ACTIV CONTROL
    ('hub_b27c47faa4e7', '69de80265f90e1f218e01082'),  -- Máquina de Vendas
    ('hub_3222742d0902', '69de80285f90e1f218e010da'),  -- Portal da MPB
    ('hub_e6fbcd89f524', '69de802a1fa8b408f61ec6dd')   -- Portal Pr Edivan Campos
) AS m(public_id, new_workspace_id)
JOIN tenants t ON t.public_id = m.public_id
WHERE ts.tenant_id = t.id;

-- 3. Limpar workspace IDs de outros tenants que tinham workspace antigo mas não estão no mapeamento
--    (serão recriados automaticamente via ensureGumletWorkspace no próximo upload)
UPDATE tenant_settings ts
SET gumlet_workspace_id = NULL
WHERE gumlet_workspace_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = ts.tenant_id
      AND t.public_id IN (
        'hub_270fe4e74a94', 'hub_abe5b9507fee', 'hub_7006ba0e3a81',
        'hub_0fd699cfbc4d', 'hub_6204b3f8b067', 'hub_a5fa3e61884f',
        'hub_b27c47faa4e7', 'hub_3222742d0902', 'hub_e6fbcd89f524'
      )
  );

-- 4. Marcar todos os assets de vídeo como 'deleted' (vídeos perdidos na troca de conta)
UPDATE assets
SET status = 'deleted'
WHERE type = 'video'
  AND status != 'deleted';

-- 5. Remover lesson_videos que apontavam para Gumlet (vídeos perdidos)
DELETE FROM lesson_videos
WHERE provider = 'gumlet';

-- 6. Limpar gumlet_collection_id das lesson_videos restantes (outros providers)
UPDATE lesson_videos
SET gumlet_collection_id = NULL
WHERE gumlet_collection_id IS NOT NULL;
