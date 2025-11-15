-- =============================================================================
-- Migration: Add AI Language Model Support
-- Issue: #846
-- =============================================================================

BEGIN;

-- =============================================================================
-- Phase 1: Create New Tables
-- =============================================================================

-- Create AiLanguageModel table
CREATE TABLE "AiLanguageModel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "canDoEmbedding" BOOLEAN NOT NULL DEFAULT false,
    "canDoChatCompletion" BOOLEAN NOT NULL DEFAULT false,
    "canDoVision" BOOLEAN NOT NULL DEFAULT false,
    "canDoFunctionCalling" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "AiLanguageModel_pkey" PRIMARY KEY ("id")
);

-- Create AiModelUsage table
CREATE TABLE "AiModelUsage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelId" TEXT NOT NULL,
    "userId" TEXT,
    "libraryId" TEXT,
    "assistantId" TEXT,
    "listId" TEXT,
    "providerName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "tokensInput" INTEGER,
    "tokensOutput" INTEGER,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "durationMs" INTEGER,

    CONSTRAINT "AiModelUsage_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- Phase 2: Add New Columns to Existing Tables
-- =============================================================================

-- Add FK columns (all nullable - preserve NULL values, no data repair)
ALTER TABLE "AiAssistant" ADD COLUMN "languageModelId" TEXT;
ALTER TABLE "AiLibrary" ADD COLUMN "embeddingModelId" TEXT;
ALTER TABLE "AiLibrary" ADD COLUMN "ocrModelId" TEXT;
ALTER TABLE "AiListField" ADD COLUMN "languageModelId" TEXT;

-- =============================================================================
-- Phase 3: Create Indexes
-- =============================================================================

CREATE UNIQUE INDEX "AiLanguageModel_provider_name_key" ON "AiLanguageModel"("provider", "name");

CREATE INDEX "AiModelUsage_userId_createdAt_idx" ON "AiModelUsage"("userId", "createdAt");
CREATE INDEX "AiModelUsage_modelId_createdAt_idx" ON "AiModelUsage"("modelId", "createdAt");
CREATE INDEX "AiModelUsage_libraryId_createdAt_idx" ON "AiModelUsage"("libraryId", "createdAt");
CREATE INDEX "AiModelUsage_createdAt_idx" ON "AiModelUsage"("createdAt");

-- =============================================================================
-- Phase 4: Data Migration - Populate AiLanguageModel from Existing Data
-- =============================================================================

-- Step 4.1: UPSERT models from embeddingModelName - add embedding capability
INSERT INTO "AiLanguageModel" ("id", "createdAt", "updatedAt", "name", "provider", "canDoEmbedding", "canDoChatCompletion", "canDoVision", "canDoFunctionCalling", "enabled", "deleted")
SELECT
    gen_random_uuid()::text AS id,
    NOW() AS "createdAt",
    NOW() AS "updatedAt",
    unique_names.name,
    'ollama' AS provider,
    true AS "canDoEmbedding",
    false AS "canDoChatCompletion",
    false AS "canDoVision",
    false AS "canDoFunctionCalling",
    true AS enabled,
    false AS deleted
FROM (
    SELECT DISTINCT "embeddingModelName" AS name
    FROM "AiLibrary"
    WHERE "embeddingModelName" IS NOT NULL
) AS unique_names
ON CONFLICT ("provider", "name") DO UPDATE SET
    "canDoEmbedding" = true,
    "updatedAt" = NOW();

-- Step 4.2: UPSERT models from AiAssistant - add chat + function calling capabilities
INSERT INTO "AiLanguageModel" ("id", "createdAt", "updatedAt", "name", "provider", "canDoEmbedding", "canDoChatCompletion", "canDoVision", "canDoFunctionCalling", "enabled", "deleted")
SELECT
    gen_random_uuid()::text AS id,
    NOW() AS "createdAt",
    NOW() AS "updatedAt",
    unique_names.name,
    'ollama' AS provider,
    false AS "canDoEmbedding",
    true AS "canDoChatCompletion",
    false AS "canDoVision",
    true AS "canDoFunctionCalling",
    true AS enabled,
    false AS deleted
FROM (
    SELECT DISTINCT "languageModel" AS name
    FROM "AiAssistant"
    WHERE "languageModel" IS NOT NULL
) AS unique_names
ON CONFLICT ("provider", "name") DO UPDATE SET
    "canDoChatCompletion" = true,
    "canDoFunctionCalling" = true,
    "updatedAt" = NOW();

-- Step 4.3: UPSERT models from AiListField - add chat + function calling capabilities
INSERT INTO "AiLanguageModel" ("id", "createdAt", "updatedAt", "name", "provider", "canDoEmbedding", "canDoChatCompletion", "canDoVision", "canDoFunctionCalling", "enabled", "deleted")
SELECT
    gen_random_uuid()::text AS id,
    NOW() AS "createdAt",
    NOW() AS "updatedAt",
    unique_names.name,
    'ollama' AS provider,
    false AS "canDoEmbedding",
    true AS "canDoChatCompletion",
    false AS "canDoVision",
    true AS "canDoFunctionCalling",
    true AS enabled,
    false AS deleted
FROM (
    SELECT DISTINCT "languageModel" AS name
    FROM "AiListField"
    WHERE "languageModel" IS NOT NULL
) AS unique_names
ON CONFLICT ("provider", "name") DO UPDATE SET
    "canDoChatCompletion" = true,
    "canDoFunctionCalling" = true,
    "updatedAt" = NOW();

-- NOTE: OCR model migration is handled at runtime (see Phase 6 in issue #846)
-- Runtime migration will read from fileConverterOptions JSON and populate ocrModelId

-- Step 4.4: Update AiLibrary.embeddingModelId FK (only where embeddingModelName is NOT NULL)
UPDATE "AiLibrary" l
SET "embeddingModelId" = m.id
FROM "AiLanguageModel" m
WHERE m.provider = 'ollama'
    AND m.name = l."embeddingModelName"
    AND l."embeddingModelName" IS NOT NULL;

-- Step 4.6: Update AiAssistant.languageModelId FK (only where languageModel is NOT NULL)
UPDATE "AiAssistant" a
SET "languageModelId" = m.id
FROM "AiLanguageModel" m
WHERE m.provider = 'ollama'
    AND m.name = a."languageModel"
    AND a."languageModel" IS NOT NULL;

-- Step 4.7: Update AiListField.languageModelId FK (only where languageModel is NOT NULL)
UPDATE "AiListField" f
SET "languageModelId" = m.id
FROM "AiLanguageModel" m
WHERE m.provider = 'ollama'
    AND m.name = f."languageModel"
    AND f."languageModel" IS NOT NULL;

-- NOTE: ocrModelId will be populated at runtime (Phase 6 - OCR Runtime Migration)

-- =============================================================================
-- Phase 5: Add Foreign Key Constraints
-- =============================================================================

ALTER TABLE "AiAssistant" ADD CONSTRAINT "AiAssistant_languageModelId_fkey"
    FOREIGN KEY ("languageModelId") REFERENCES "AiLanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiLibrary" ADD CONSTRAINT "AiLibrary_embeddingModelId_fkey"
    FOREIGN KEY ("embeddingModelId") REFERENCES "AiLanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiLibrary" ADD CONSTRAINT "AiLibrary_ocrModelId_fkey"
    FOREIGN KEY ("ocrModelId") REFERENCES "AiLanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiListField" ADD CONSTRAINT "AiListField_languageModelId_fkey"
    FOREIGN KEY ("languageModelId") REFERENCES "AiLanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiModelUsage" ADD CONSTRAINT "AiModelUsage_modelId_fkey"
    FOREIGN KEY ("modelId") REFERENCES "AiLanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiModelUsage" ADD CONSTRAINT "AiModelUsage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AiModelUsage" ADD CONSTRAINT "AiModelUsage_libraryId_fkey"
    FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AiModelUsage" ADD CONSTRAINT "AiModelUsage_assistantId_fkey"
    FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AiModelUsage" ADD CONSTRAINT "AiModelUsage_listId_fkey"
    FOREIGN KEY ("listId") REFERENCES "AiList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- Phase 6: Drop Old Columns
-- =============================================================================

-- Drop old string-based model columns (data already migrated to FK columns)
ALTER TABLE "AiAssistant" DROP COLUMN "languageModel";
ALTER TABLE "AiLibrary" DROP COLUMN "embeddingModelName";
ALTER TABLE "AiListField" DROP COLUMN "languageModel";

-- Note: fileConverterOptions.ocrModel remains in JSON for backward compatibility
-- Runtime migration will handle gradual transition from JSON to ocrModelId column

COMMIT;
