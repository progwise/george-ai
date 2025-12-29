-- Fix workspaces with single member: set their role to 'owner'
-- This corrects cases where a workspace creator was incorrectly assigned 'admin' role

UPDATE "WorkspaceMember"
SET role = 'owner'
WHERE "workspaceId" IN (
  SELECT "workspaceId"
  FROM "WorkspaceMember"
  GROUP BY "workspaceId"
  HAVING COUNT(*) = 1
);
