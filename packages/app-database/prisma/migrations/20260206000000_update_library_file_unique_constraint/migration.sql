-- Migration: Update AiLibraryFile unique constraint from [crawledByCrawlerId, originUri] to [libraryId, originUri]
-- This migration handles duplicate records by keeping only the latest (based on updatedAt)

-- Step 1: Drop the old unique constraint
DROP INDEX IF EXISTS "AiLibraryFile_crawledByCrawlerId_originUri_key";

-- Step 2: Handle duplicates - Delete older records, keeping only the latest for each libraryId+originUri combination
-- This uses a CTE to identify duplicates and delete all but the most recent record
WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "libraryId", "originUri"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
    ) as row_num
  FROM "AiLibraryFile"
  WHERE "originUri" IS NOT NULL
),
ids_to_delete AS (
  SELECT id
  FROM duplicates
  WHERE row_num > 1
)
DELETE FROM "AiLibraryFile"
WHERE id IN (SELECT id FROM ids_to_delete);

-- Step 3: Add the new unique constraint
-- PostgreSQL allows multiple NULL values in unique constraints by default
ALTER TABLE "AiLibraryFile" ADD CONSTRAINT "AiLibraryFile_libraryId_originUri_key"
UNIQUE ("libraryId", "originUri");
