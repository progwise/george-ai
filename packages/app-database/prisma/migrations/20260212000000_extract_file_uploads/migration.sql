-- Migration: Extract uploadedAt from AiLibraryFile into new FileUploads table
-- Non-destructive: existing uploadedAt values are preserved as FileUploads entries

-- Step 1: Create the FileUploads table
CREATE TABLE "FileUploads" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "fileId" TEXT NOT NULL,
    "uploadUrl" TEXT NOT NULL,

    CONSTRAINT "FileUploads_pkey" PRIMARY KEY ("id")
);

-- Step 2: Migrate existing uploadedAt data into FileUploads
-- For each AiLibraryFile with a non-null uploadedAt, create a FileUploads entry
INSERT INTO "FileUploads" ("id", "createdAt", "finishedAt", "fileId", "uploadUrl")
SELECT
    gen_random_uuid()::text,
    "uploadedAt",
    "uploadedAt",
    "id",
    'legacy'
FROM "AiLibraryFile"
WHERE "uploadedAt" IS NOT NULL;

-- Step 3: Drop the old uploadedAt column
ALTER TABLE "AiLibraryFile" DROP COLUMN "uploadedAt";

-- Step 4: Add foreign key constraint
ALTER TABLE "FileUploads" ADD CONSTRAINT "FileUploads_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
