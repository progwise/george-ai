-- AlterTable
ALTER TABLE "public"."AiServiceProvider" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Workspace" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."WorkspaceMember" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Rename "System" workspace to "Shared"
UPDATE "public"."Workspace"
SET
  "name" = 'Shared',
  "slug" = 'shared'
WHERE "id" = '00000000-0000-0000-0000-000000000001';
