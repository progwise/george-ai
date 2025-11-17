-- Migration: Add Workspace Multi-Tenancy Support
-- Wrap entire migration in an explicit transaction for safety
BEGIN;

-- 1. Create Workspace table
CREATE TABLE "public"."Workspace" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,

  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- 2. Create WorkspaceMember table
CREATE TABLE "public"."WorkspaceMember" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,

  CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- 3. Create AiServiceProvider table
CREATE TABLE "public"."AiServiceProvider" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "baseUrl" TEXT,
  "apiKey" TEXT,
  "vramGb" INTEGER,
  "createdBy" TEXT,
  "updatedBy" TEXT,

  CONSTRAINT "AiServiceProvider_pkey" PRIMARY KEY ("id")
);

-- 4. Create default "System" workspace (fixed UUID for easy reference)
INSERT INTO "public"."Workspace" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'System',
  'system',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 5. Add workspaceId columns as NULLABLE first (to allow data population)
ALTER TABLE "public"."User"
  ADD COLUMN IF NOT EXISTS "defaultWorkspaceId" TEXT;

ALTER TABLE "public"."AiLibrary"
  ADD COLUMN IF NOT EXISTS "workspaceId" TEXT;

ALTER TABLE "public"."AiAssistant"
  ADD COLUMN IF NOT EXISTS "workspaceId" TEXT;

ALTER TABLE "public"."AiList"
  ADD COLUMN IF NOT EXISTS "workspaceId" TEXT;

-- 6. Populate existing data with default workspace
UPDATE "public"."User"
  SET "defaultWorkspaceId" = '00000000-0000-0000-0000-000000000001'
  WHERE "defaultWorkspaceId" IS NULL;

UPDATE "public"."AiLibrary"
  SET "workspaceId" = '00000000-0000-0000-0000-000000000001'
  WHERE "workspaceId" IS NULL;

UPDATE "public"."AiAssistant"
  SET "workspaceId" = '00000000-0000-0000-0000-000000000001'
  WHERE "workspaceId" IS NULL;

UPDATE "public"."AiList"
  SET "workspaceId" = '00000000-0000-0000-0000-000000000001'
  WHERE "workspaceId" IS NULL;

-- 7. Add all existing users to default workspace as owners
INSERT INTO "public"."WorkspaceMember" ("id", "workspaceId", "userId", "role", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  "id",
  'owner',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "public"."User"
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."WorkspaceMember"
  WHERE "userId" = "User"."id"
  AND "workspaceId" = '00000000-0000-0000-0000-000000000001'
);

-- 8. Make workspaceId columns non-nullable after data migration
ALTER TABLE "public"."User"
  ALTER COLUMN "defaultWorkspaceId" SET NOT NULL;

ALTER TABLE "public"."AiLibrary"
  ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "public"."AiAssistant"
  ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "public"."AiList"
  ALTER COLUMN "workspaceId" SET NOT NULL;

-- 9. Create unique indexes
CREATE UNIQUE INDEX "Workspace_slug_key" ON "public"."Workspace"("slug");

CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key"
  ON "public"."WorkspaceMember"("workspaceId", "userId");

CREATE UNIQUE INDEX "AiServiceProvider_workspaceId_provider_name_key"
  ON "public"."AiServiceProvider"("workspaceId", "provider", "name");

-- 10. Create performance indexes
CREATE INDEX "User_defaultWorkspaceId_idx" ON "public"."User"("defaultWorkspaceId");

CREATE INDEX "AiLibrary_workspaceId_idx" ON "public"."AiLibrary"("workspaceId");

CREATE INDEX "AiAssistant_workspaceId_idx" ON "public"."AiAssistant"("workspaceId");

CREATE INDEX "AiList_workspaceId_idx" ON "public"."AiList"("workspaceId");

CREATE INDEX "WorkspaceMember_userId_idx" ON "public"."WorkspaceMember"("userId");

CREATE INDEX "AiServiceProvider_workspaceId_enabled_idx"
  ON "public"."AiServiceProvider"("workspaceId", "enabled");

-- 11. Add foreign key constraints
ALTER TABLE "public"."User"
  ADD CONSTRAINT "User_defaultWorkspaceId_fkey"
  FOREIGN KEY ("defaultWorkspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."WorkspaceMember"
  ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."WorkspaceMember"
  ADD CONSTRAINT "WorkspaceMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."AiServiceProvider"
  ADD CONSTRAINT "AiServiceProvider_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."AiLibrary"
  ADD CONSTRAINT "AiLibrary_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."AiAssistant"
  ADD CONSTRAINT "AiAssistant_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."AiList"
  ADD CONSTRAINT "AiList_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
