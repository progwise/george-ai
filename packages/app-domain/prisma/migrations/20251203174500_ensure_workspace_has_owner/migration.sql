-- Ensure every workspace has at least one owner
-- For workspaces without an owner:
-- 1. First try to promote an admin to owner
-- 2. If no admin, promote the first member to owner

-- Step 1: Promote first admin to owner for workspaces without any owner
UPDATE "WorkspaceMember"
SET role = 'owner'
WHERE id IN (
  SELECT DISTINCT ON (wm."workspaceId") wm.id
  FROM "WorkspaceMember" wm
  WHERE wm.role = 'admin'
    AND wm."workspaceId" NOT IN (
      SELECT "workspaceId" FROM "WorkspaceMember" WHERE role = 'owner'
    )
  ORDER BY wm."workspaceId", wm."createdAt" ASC
);

-- Step 2: For any remaining workspaces still without an owner, promote first member
UPDATE "WorkspaceMember"
SET role = 'owner'
WHERE id IN (
  SELECT DISTINCT ON (wm."workspaceId") wm.id
  FROM "WorkspaceMember" wm
  WHERE wm."workspaceId" NOT IN (
      SELECT "workspaceId" FROM "WorkspaceMember" WHERE role = 'owner'
    )
  ORDER BY wm."workspaceId", wm."createdAt" ASC
);
