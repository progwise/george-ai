-- Rename file property from 'processedAt' to 'extractedAt' in existing list fields
UPDATE "AiListField"
SET "fileProperty" = 'extractedAt'
WHERE "fileProperty" = 'processedAt';
