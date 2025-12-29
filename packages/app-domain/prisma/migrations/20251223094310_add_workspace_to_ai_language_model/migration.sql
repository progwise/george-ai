-- =========================================
-- Phase 1: Add workspaceId column (nullable)
-- =========================================

ALTER TABLE "public"."AiLanguageModel" ADD COLUMN "workspaceId" TEXT;

-- =========================================
-- Phase 1.5: Drop old unique constraint to allow duplicate provider+name
-- =========================================

-- Drop old constraint: [provider, name]
DROP INDEX IF EXISTS "AiLanguageModel_provider_name_key";
ALTER TABLE "public"."AiLanguageModel"
  DROP CONSTRAINT IF EXISTS "AiLanguageModel_provider_name_key";

-- =========================================
-- Phase 2: Create workspace-scoped models based on actual usage
-- =========================================

-- Strategy: Create models only for workspaces that actually use them
-- Uses bulk INSERT...SELECT for efficiency

-- From AiLibrary.embeddingModelId
INSERT INTO "public"."AiLanguageModel" (
  id, "createdAt", "updatedAt", "workspaceId", name, provider,
  "canDoEmbedding", "canDoChatCompletion", "canDoVision",
  "canDoFunctionCalling", enabled, "adminNotes", "lastUsedAt"
)
SELECT
  gen_random_uuid()::TEXT,
  MAX(model."createdAt"),
  MAX(model."updatedAt"),
  lib."workspaceId",
  model.name,
  model.provider,
  BOOL_OR(model."canDoEmbedding"),
  BOOL_OR(model."canDoChatCompletion"),
  BOOL_OR(model."canDoVision"),
  BOOL_OR(model."canDoFunctionCalling"),
  BOOL_OR(model.enabled),
  MAX(model."adminNotes"),
  MAX(model."lastUsedAt")
FROM "public"."AiLibrary" lib
INNER JOIN "public"."AiLanguageModel" model ON lib."embeddingModelId" = model.id
WHERE model."workspaceId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."AiLanguageModel" existing
    WHERE existing."workspaceId" = lib."workspaceId"
      AND existing.provider = model.provider
      AND existing.name = model.name
  )
GROUP BY lib."workspaceId", model.provider, model.name;

-- From AiLibrary.ocrModelId
INSERT INTO "public"."AiLanguageModel" (
  id, "createdAt", "updatedAt", "workspaceId", name, provider,
  "canDoEmbedding", "canDoChatCompletion", "canDoVision",
  "canDoFunctionCalling", enabled, "adminNotes", "lastUsedAt"
)
SELECT
  gen_random_uuid()::TEXT,
  MAX(model."createdAt"),
  MAX(model."updatedAt"),
  lib."workspaceId",
  model.name,
  model.provider,
  BOOL_OR(model."canDoEmbedding"),
  BOOL_OR(model."canDoChatCompletion"),
  BOOL_OR(model."canDoVision"),
  BOOL_OR(model."canDoFunctionCalling"),
  BOOL_OR(model.enabled),
  MAX(model."adminNotes"),
  MAX(model."lastUsedAt")
FROM "public"."AiLibrary" lib
INNER JOIN "public"."AiLanguageModel" model ON lib."ocrModelId" = model.id
WHERE model."workspaceId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."AiLanguageModel" existing
    WHERE existing."workspaceId" = lib."workspaceId"
      AND existing.provider = model.provider
      AND existing.name = model.name
  )
GROUP BY lib."workspaceId", model.provider, model.name;

-- From AiLibrary.extractionModelId
INSERT INTO "public"."AiLanguageModel" (
  id, "createdAt", "updatedAt", "workspaceId", name, provider,
  "canDoEmbedding", "canDoChatCompletion", "canDoVision",
  "canDoFunctionCalling", enabled, "adminNotes", "lastUsedAt"
)
SELECT
  gen_random_uuid()::TEXT,
  MAX(model."createdAt"),
  MAX(model."updatedAt"),
  lib."workspaceId",
  model.name,
  model.provider,
  BOOL_OR(model."canDoEmbedding"),
  BOOL_OR(model."canDoChatCompletion"),
  BOOL_OR(model."canDoVision"),
  BOOL_OR(model."canDoFunctionCalling"),
  BOOL_OR(model.enabled),
  MAX(model."adminNotes"),
  MAX(model."lastUsedAt")
FROM "public"."AiLibrary" lib
INNER JOIN "public"."AiLanguageModel" model ON lib."extractionModelId" = model.id
WHERE model."workspaceId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."AiLanguageModel" existing
    WHERE existing."workspaceId" = lib."workspaceId"
      AND existing.provider = model.provider
      AND existing.name = model.name
  )
GROUP BY lib."workspaceId", model.provider, model.name;

-- From AiAssistant.languageModelId
INSERT INTO "public"."AiLanguageModel" (
  id, "createdAt", "updatedAt", "workspaceId", name, provider,
  "canDoEmbedding", "canDoChatCompletion", "canDoVision",
  "canDoFunctionCalling", enabled, "adminNotes", "lastUsedAt"
)
SELECT
  gen_random_uuid()::TEXT,
  MAX(model."createdAt"),
  MAX(model."updatedAt"),
  asst."workspaceId",
  model.name,
  model.provider,
  BOOL_OR(model."canDoEmbedding"),
  BOOL_OR(model."canDoChatCompletion"),
  BOOL_OR(model."canDoVision"),
  BOOL_OR(model."canDoFunctionCalling"),
  BOOL_OR(model.enabled),
  MAX(model."adminNotes"),
  MAX(model."lastUsedAt")
FROM "public"."AiAssistant" asst
INNER JOIN "public"."AiLanguageModel" model ON asst."languageModelId" = model.id
WHERE model."workspaceId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."AiLanguageModel" existing
    WHERE existing."workspaceId" = asst."workspaceId"
      AND existing.provider = model.provider
      AND existing.name = model.name
  )
GROUP BY asst."workspaceId", model.provider, model.name;

-- From AiListField.languageModelId
INSERT INTO "public"."AiLanguageModel" (
  id, "createdAt", "updatedAt", "workspaceId", name, provider,
  "canDoEmbedding", "canDoChatCompletion", "canDoVision",
  "canDoFunctionCalling", enabled, "adminNotes", "lastUsedAt"
)
SELECT
  gen_random_uuid()::TEXT,
  MAX(model."createdAt"),
  MAX(model."updatedAt"),
  list."workspaceId",
  model.name,
  model.provider,
  BOOL_OR(model."canDoEmbedding"),
  BOOL_OR(model."canDoChatCompletion"),
  BOOL_OR(model."canDoVision"),
  BOOL_OR(model."canDoFunctionCalling"),
  BOOL_OR(model.enabled),
  MAX(model."adminNotes"),
  MAX(model."lastUsedAt")
FROM "public"."AiListField" field
INNER JOIN "public"."AiList" list ON field."listId" = list.id
INNER JOIN "public"."AiLanguageModel" model ON field."languageModelId" = model.id
WHERE model."workspaceId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."AiLanguageModel" existing
    WHERE existing."workspaceId" = list."workspaceId"
      AND existing.provider = model.provider
      AND existing.name = model.name
  )
GROUP BY list."workspaceId", model.provider, model.name;

-- From AiContentProcessingTask.embeddingModelId
INSERT INTO "public"."AiLanguageModel" (
  id, "createdAt", "updatedAt", "workspaceId", name, provider,
  "canDoEmbedding", "canDoChatCompletion", "canDoVision",
  "canDoFunctionCalling", enabled, "adminNotes", "lastUsedAt"
)
SELECT
  gen_random_uuid()::TEXT,
  MAX(model."createdAt"),
  MAX(model."updatedAt"),
  lib."workspaceId",
  model.name,
  model.provider,
  BOOL_OR(model."canDoEmbedding"),
  BOOL_OR(model."canDoChatCompletion"),
  BOOL_OR(model."canDoVision"),
  BOOL_OR(model."canDoFunctionCalling"),
  BOOL_OR(model.enabled),
  MAX(model."adminNotes"),
  MAX(model."lastUsedAt")
FROM "public"."AiContentProcessingTask" task
INNER JOIN "public"."AiLibrary" lib ON task."libraryId" = lib.id
INNER JOIN "public"."AiLanguageModel" model ON task."embeddingModelId" = model.id
WHERE model."workspaceId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."AiLanguageModel" existing
    WHERE existing."workspaceId" = lib."workspaceId"
      AND existing.provider = model.provider
      AND existing.name = model.name
  )
GROUP BY lib."workspaceId", model.provider, model.name;

-- Create shared workspace copies for all global models (for historical usage data)
INSERT INTO "public"."AiLanguageModel" (
  id, "createdAt", "updatedAt", "workspaceId", name, provider,
  "canDoEmbedding", "canDoChatCompletion", "canDoVision",
  "canDoFunctionCalling", enabled, "adminNotes", "lastUsedAt"
)
SELECT
  gen_random_uuid()::TEXT,
  MAX("createdAt"),
  MAX("updatedAt"),
  '00000000-0000-0000-0000-000000000001',  -- Shared workspace
  name,
  provider,
  BOOL_OR("canDoEmbedding"),
  BOOL_OR("canDoChatCompletion"),
  BOOL_OR("canDoVision"),
  BOOL_OR("canDoFunctionCalling"),
  BOOL_OR(enabled),
  MAX("adminNotes"),
  MAX("lastUsedAt")
FROM "public"."AiLanguageModel"
WHERE "workspaceId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."AiLanguageModel" existing
    WHERE existing."workspaceId" = '00000000-0000-0000-0000-000000000001'
      AND existing.provider = "AiLanguageModel".provider
      AND existing.name = "AiLanguageModel".name
  )
GROUP BY provider, name;

-- =========================================
-- Phase 3: Update foreign key references
-- =========================================

-- Update AiLibrary.embeddingModelId
UPDATE "public"."AiLibrary" lib
SET "embeddingModelId" = new_model.id
FROM "public"."AiLanguageModel" old_model,
     "public"."AiLanguageModel" new_model
WHERE lib."embeddingModelId" = old_model.id
  AND old_model."workspaceId" IS NULL  -- Old global model
  AND new_model."workspaceId" = lib."workspaceId"  -- Match workspace
  AND new_model.provider = old_model.provider
  AND new_model.name = old_model.name;

-- Update AiLibrary.ocrModelId
UPDATE "public"."AiLibrary" lib
SET "ocrModelId" = new_model.id
FROM "public"."AiLanguageModel" old_model,
     "public"."AiLanguageModel" new_model
WHERE lib."ocrModelId" = old_model.id
  AND old_model."workspaceId" IS NULL
  AND new_model."workspaceId" = lib."workspaceId"
  AND new_model.provider = old_model.provider
  AND new_model.name = old_model.name;

-- Update AiLibrary.extractionModelId
UPDATE "public"."AiLibrary" lib
SET "extractionModelId" = new_model.id
FROM "public"."AiLanguageModel" old_model,
     "public"."AiLanguageModel" new_model
WHERE lib."extractionModelId" = old_model.id
  AND old_model."workspaceId" IS NULL
  AND new_model."workspaceId" = lib."workspaceId"
  AND new_model.provider = old_model.provider
  AND new_model.name = old_model.name;

-- Update AiAssistant.languageModelId
UPDATE "public"."AiAssistant" asst
SET "languageModelId" = new_model.id
FROM "public"."AiLanguageModel" old_model,
     "public"."AiLanguageModel" new_model
WHERE asst."languageModelId" = old_model.id
  AND old_model."workspaceId" IS NULL
  AND new_model."workspaceId" = asst."workspaceId"
  AND new_model.provider = old_model.provider
  AND new_model.name = old_model.name;

-- Update AiListField.languageModelId
UPDATE "public"."AiListField" field
SET "languageModelId" = new_model.id
FROM "public"."AiLanguageModel" old_model,
     "public"."AiLanguageModel" new_model,
     "public"."AiList" list
WHERE field."languageModelId" = old_model.id
  AND field."listId" = list.id
  AND old_model."workspaceId" IS NULL
  AND new_model."workspaceId" = list."workspaceId"
  AND new_model.provider = old_model.provider
  AND new_model.name = old_model.name;

-- Update AiContentProcessingTask.embeddingModelId
UPDATE "public"."AiContentProcessingTask" task
SET "embeddingModelId" = new_model.id
FROM "public"."AiLanguageModel" old_model,
     "public"."AiLanguageModel" new_model,
     "public"."AiLibrary" lib
WHERE task."embeddingModelId" = old_model.id
  AND task."libraryId" = lib.id
  AND old_model."workspaceId" IS NULL
  AND new_model."workspaceId" = lib."workspaceId"
  AND new_model.provider = old_model.provider
  AND new_model.name = old_model.name;

-- =========================================
-- Phase 4: Migrate AiModelUsage to shared workspace
-- =========================================

-- All existing usage records point to "shared" workspace models
UPDATE "public"."AiModelUsage" usage
SET "modelId" = shared_model.id
FROM "public"."AiLanguageModel" old_model,
     "public"."AiLanguageModel" shared_model
WHERE usage."modelId" = old_model.id
  AND old_model."workspaceId" IS NULL
  AND shared_model."workspaceId" = '00000000-0000-0000-0000-000000000001'
  AND shared_model.provider = old_model.provider
  AND shared_model.name = old_model.name;

-- =========================================
-- Phase 5: Delete old global models
-- =========================================

DELETE FROM "public"."AiLanguageModel"
WHERE "workspaceId" IS NULL;

-- =========================================
-- Phase 6: Make workspaceId non-nullable
-- =========================================

ALTER TABLE "public"."AiLanguageModel"
  ALTER COLUMN "workspaceId" SET NOT NULL;

-- =========================================
-- Phase 7: Add new unique constraint
-- =========================================

-- Add new constraint: [workspaceId, provider, name]
CREATE UNIQUE INDEX "AiLanguageModel_workspaceId_provider_name_key"
  ON "public"."AiLanguageModel"("workspaceId", provider, name);

-- =========================================
-- Phase 8: Add indexes and foreign key
-- =========================================

-- Index for workspace filtering
CREATE INDEX "AiLanguageModel_workspaceId_enabled_idx"
  ON "public"."AiLanguageModel"("workspaceId", enabled);

-- Foreign key constraint
ALTER TABLE "public"."AiLanguageModel"
  ADD CONSTRAINT "AiLanguageModel_workspaceId_fkey"
  FOREIGN KEY ("workspaceId")
  REFERENCES "public"."Workspace"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
