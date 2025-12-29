-- AlterTable
BEGIN;

-- First, disable all models that were marked as deleted
UPDATE "AiLanguageModel" SET "enabled" = false WHERE "deleted" = true;

-- Then drop the deleted column
ALTER TABLE "AiLanguageModel" DROP COLUMN "deleted";

COMMIT;
