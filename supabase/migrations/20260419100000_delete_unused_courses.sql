-- ==============================================
-- Delete courses from tenant hub_0fd699cfbc4d that are not linked to any product
-- ==============================================

DELETE FROM public.courses c
WHERE c.tenant_id = (SELECT id FROM public.tenants WHERE public_id = 'hub_0fd699cfbc4d')
  AND NOT EXISTS (
    SELECT 1 FROM public.product_courses pc
    WHERE pc.course_id = c.id
  );
