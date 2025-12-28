-- Fix workspace member roles based on user admin status
BEGIN;

-- Update workspace members to have correct roles:
-- - First admin user becomes 'owner'
-- - Other admins become 'admin'
-- - Regular users become 'member'

-- First, find the first admin user (by creation date) and make them owner
WITH first_admin AS (
  SELECT u.id
  FROM "public"."User" u
  WHERE u."isAdmin" = true
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
UPDATE "public"."WorkspaceMember" wm
SET role = 'owner'
FROM first_admin
WHERE wm."userId" = first_admin.id
  AND wm."workspaceId" = '00000000-0000-0000-0000-000000000001';

-- Make other admins 'admin' role
UPDATE "public"."WorkspaceMember" wm
SET role = 'admin'
FROM "public"."User" u
WHERE wm."userId" = u.id
  AND u."isAdmin" = true
  AND wm.role != 'owner'  -- Don't change the owner we just set
  AND wm."workspaceId" = '00000000-0000-0000-0000-000000000001';

-- Make regular users 'member' role
UPDATE "public"."WorkspaceMember" wm
SET role = 'member'
FROM "public"."User" u
WHERE wm."userId" = u.id
  AND u."isAdmin" = false
  AND wm."workspaceId" = '00000000-0000-0000-0000-000000000001';

COMMIT;
