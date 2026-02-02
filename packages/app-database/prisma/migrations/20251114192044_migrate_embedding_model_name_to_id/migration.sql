-- Wrap entire migration in a transaction
BEGIN;

-- Step 1: Add new embeddingModelId column
ALTER TABLE "AiContentProcessingTask" ADD COLUMN "embeddingModelId" TEXT;

-- Step 2: Insert missing models into AiLanguageModel
-- Get distinct embedding model names from content processing tasks that don't exist in AiLanguageModel
INSERT INTO "AiLanguageModel" (id, "createdAt", "updatedAt", name, provider, "canDoEmbedding", "canDoChatCompletion", "canDoVision", "canDoFunctionCalling", enabled, deleted)
SELECT
  gen_random_uuid()::text,
  NOW(),
  NOW(),
  DISTINCT_models.name,
  'ollama',
  true,
  false,
  false,
  false,
  true,
  false
FROM (
  SELECT DISTINCT "embeddingModelName" as name
  FROM "AiContentProcessingTask"
  WHERE "embeddingModelName" IS NOT NULL
) DISTINCT_models
WHERE NOT EXISTS (
  SELECT 1
  FROM "AiLanguageModel"
  WHERE "AiLanguageModel".provider = 'ollama'
    AND "AiLanguageModel".name = DISTINCT_models.name
);

-- Step 3: Fill in embeddingModelId by matching embeddingModelName to AiLanguageModel
UPDATE "AiContentProcessingTask" cpt
SET "embeddingModelId" = (
  SELECT lm.id
  FROM "AiLanguageModel" lm
  WHERE lm.provider = 'ollama'
    AND lm.name = cpt."embeddingModelName"
  LIMIT 1
)
WHERE cpt."embeddingModelName" IS NOT NULL;

-- Step 4: Drop the old embeddingModelName column
ALTER TABLE "AiContentProcessingTask" DROP COLUMN "embeddingModelName";

-- Step 5: Add foreign key constraint
ALTER TABLE "AiContentProcessingTask"
  ADD CONSTRAINT "AiContentProcessingTask_embeddingModelId_fkey"
  FOREIGN KEY ("embeddingModelId")
  REFERENCES "AiLanguageModel"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

COMMIT;
