-- Migration: ensure_shared_workspace_exists
--
-- This is a safety migration to ensure the "Shared" workspace always exists.
-- On fresh database installations, the Shared workspace must exist before
-- any users can be created (users require a defaultWorkspaceId).
--
-- The original multi-tenancy migration (20251117104414) creates this workspace,
-- but this migration ensures it exists even if:
-- - The database was partially migrated
-- - There were timing issues during CI/CD
-- - A fresh installation somehow missed the workspace creation
--
-- This migration is idempotent (ON CONFLICT DO NOTHING).

INSERT INTO "Workspace" (id, name, slug, "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Shared',
  'shared',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
