-- Drop AiFileExtraction table
DROP TABLE "AiFileExtraction";

-- Remove fields from AiListSource
ALTER TABLE "AiListSource" DROP COLUMN "extractionStrategy";
ALTER TABLE "AiListSource" DROP COLUMN "extractionConfig";
