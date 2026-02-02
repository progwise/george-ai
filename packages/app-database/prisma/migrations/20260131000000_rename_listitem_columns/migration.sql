-- Non-destructive migration: Rename columns and add new fields to AiListItem
-- This migration preserves all existing data

-- Step 1: Add new columns first (before renaming)
ALTER TABLE "AiListItem" ADD COLUMN "extractionMethod" TEXT NOT NULL DEFAULT 'legacyExtraction';
ALTER TABLE "AiListItem" ADD COLUMN "fragmentHash" TEXT;

-- Step 2: Drop existing constraints that reference old column names
DROP INDEX IF EXISTS "AiListItem_sourceId_sourceFileId_extractionIndex_key";
DROP INDEX IF EXISTS "AiListItem_sourceFileId_idx";
ALTER TABLE "AiListItem" DROP CONSTRAINT IF EXISTS "AiListItem_sourceFileId_fkey";

-- Step 3: Rename columns (preserves data)
ALTER TABLE "AiListItem" RENAME COLUMN "sourceFileId" TO "fileId";
ALTER TABLE "AiListItem" RENAME COLUMN "extractionIndex" TO "fragment";

-- Step 4: Recreate foreign key with new column name
ALTER TABLE "AiListItem" ADD CONSTRAINT "AiListItem_fileId_fkey"
  FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Create new indexes with updated column names
CREATE INDEX "AiListItem_fileId_idx" ON "AiListItem"("fileId");
CREATE UNIQUE INDEX "AiListItem_sourceId_fileId_extractionMethod_fragment_key"
  ON "AiListItem"("sourceId", "fileId", "extractionMethod", "fragment");
