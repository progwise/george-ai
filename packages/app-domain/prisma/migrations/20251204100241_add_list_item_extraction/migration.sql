-- Step 1: Add new columns to AiListSource
ALTER TABLE "AiListSource" ADD COLUMN "extractionStrategy" TEXT NOT NULL DEFAULT 'per_file';
ALTER TABLE "AiListSource" ADD COLUMN "extractionConfig" JSONB;

-- Step 2: Create AiListItem table
CREATE TABLE "AiListItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceFileId" TEXT NOT NULL,
    "extractionIndex" INTEGER,
    "content" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AiListItem_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create indexes for AiListItem
CREATE INDEX "AiListItem_listId_idx" ON "AiListItem"("listId");
CREATE INDEX "AiListItem_sourceFileId_idx" ON "AiListItem"("sourceFileId");
CREATE UNIQUE INDEX "AiListItem_sourceId_sourceFileId_extractionIndex_key" ON "AiListItem"("sourceId", "sourceFileId", "extractionIndex");

-- Step 4: Add foreign keys for AiListItem
ALTER TABLE "AiListItem" ADD CONSTRAINT "AiListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "AiList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiListItem" ADD CONSTRAINT "AiListItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AiListSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiListItem" ADD CONSTRAINT "AiListItem_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Populate AiListItem from existing data
-- For each file that has cache entries, create an AiListItem
-- We need to find the source for each file based on the library relationship
INSERT INTO "AiListItem" ("id", "createdAt", "updatedAt", "listId", "sourceId", "sourceFileId", "extractionIndex")
SELECT
    gen_random_uuid()::text,
    NOW(),
    NOW(),
    s."listId",
    s."id" as "sourceId",
    f."id" as "sourceFileId",
    NULL as "extractionIndex"
FROM "AiLibraryFile" f
INNER JOIN "AiListSource" s ON s."libraryId" = f."libraryId"
WHERE f."archivedAt" IS NULL;

-- Step 6: Add itemId column to AiListItemCache (nullable first)
ALTER TABLE "AiListItemCache" ADD COLUMN "itemId" TEXT;

-- Step 7: Populate itemId in AiListItemCache from the new AiListItem records
UPDATE "AiListItemCache" c
SET "itemId" = i."id"
FROM "AiListItem" i, "AiListField" lf
WHERE lf."id" = c."fieldId"
  AND i."sourceFileId" = c."fileId"
  AND i."listId" = lf."listId";

-- Step 8: Delete orphaned cache entries (where we couldn't find a matching item)
DELETE FROM "AiListItemCache" WHERE "itemId" IS NULL;

-- Step 9: Make itemId required and add foreign key
ALTER TABLE "AiListItemCache" ALTER COLUMN "itemId" SET NOT NULL;
ALTER TABLE "AiListItemCache" ADD CONSTRAINT "AiListItemCache_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AiListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Drop old constraint and column from AiListItemCache
ALTER TABLE "AiListItemCache" DROP CONSTRAINT IF EXISTS "AiListItemCache_file_fkey";
ALTER TABLE "AiListItemCache" DROP CONSTRAINT IF EXISTS "AiListItemCache_fileId_fkey";
DROP INDEX IF EXISTS "AiListItemCache_fileId_fieldId_key";
ALTER TABLE "AiListItemCache" DROP COLUMN "fileId";

-- Step 11: Add new unique constraint for AiListItemCache
CREATE UNIQUE INDEX "AiListItemCache_itemId_fieldId_key" ON "AiListItemCache"("itemId", "fieldId");

-- Step 12: Add itemId column to AiEnrichmentTask (nullable first)
ALTER TABLE "AiEnrichmentTask" ADD COLUMN "itemId" TEXT;

-- Step 13: Populate itemId in AiEnrichmentTask from the new AiListItem records
UPDATE "AiEnrichmentTask" t
SET "itemId" = i."id"
FROM "AiListItem" i
WHERE i."sourceFileId" = t."fileId"
  AND i."listId" = t."listId";

-- Step 14: Delete orphaned enrichment tasks (where we couldn't find a matching item)
DELETE FROM "AiEnrichmentTask" WHERE "itemId" IS NULL;

-- Step 15: Make itemId required and add foreign key
ALTER TABLE "AiEnrichmentTask" ALTER COLUMN "itemId" SET NOT NULL;
ALTER TABLE "AiEnrichmentTask" ADD CONSTRAINT "AiEnrichmentTask_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AiListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 16: Drop old constraints and column from AiEnrichmentTask
ALTER TABLE "AiEnrichmentTask" DROP CONSTRAINT IF EXISTS "AiEnrichmentTask_file_fkey";
ALTER TABLE "AiEnrichmentTask" DROP CONSTRAINT IF EXISTS "AiEnrichmentTask_fileId_fkey";
DROP INDEX IF EXISTS "AiEnrichmentTask_listId_fieldId_fileId_key";
DROP INDEX IF EXISTS "AiListEnrichmentQueue_listId_fieldId_fileId_key";
ALTER TABLE "AiEnrichmentTask" DROP COLUMN "fileId";

-- Step 17: Add new unique constraint for AiEnrichmentTask
CREATE UNIQUE INDEX "AiEnrichmentTask_listId_fieldId_itemId_key" ON "AiEnrichmentTask"("listId", "fieldId", "itemId");

-- Step 18: Clean up old indexes that are no longer needed
DROP INDEX IF EXISTS "AiListEnrichmentQueue_listId_status_idx";
DROP INDEX IF EXISTS "AiListEnrichmentQueue_status_priority_requestedAt_idx";
