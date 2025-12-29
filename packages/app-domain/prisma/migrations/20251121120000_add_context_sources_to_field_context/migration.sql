-- Step 1: Add id column as nullable
ALTER TABLE "AiListFieldContext" ADD COLUMN "id" TEXT;

-- Step 2: Populate existing rows with CUIDs (using gen_random_uuid as fallback)
UPDATE "AiListFieldContext" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;

-- Step 3: Make id NOT NULL
ALTER TABLE "AiListFieldContext" ALTER COLUMN "id" SET NOT NULL;

-- Step 4: Drop the old composite primary key
ALTER TABLE "AiListFieldContext" DROP CONSTRAINT "AiListFieldContext_pkey";

-- Step 5: Add new primary key on id
ALTER TABLE "AiListFieldContext" ADD CONSTRAINT "AiListFieldContext_pkey" PRIMARY KEY ("id");

-- Step 6: Make contextFieldId nullable
ALTER TABLE "AiListFieldContext" ALTER COLUMN "contextFieldId" DROP NOT NULL;

-- Step 7: Add new columns
ALTER TABLE "AiListFieldContext" ADD COLUMN "contextQuery" JSONB;
ALTER TABLE "AiListFieldContext" ADD COLUMN "maxContentTokens" INTEGER;

-- Step 8: Add unique constraint for field-based contexts (contextFieldId not null)
CREATE UNIQUE INDEX "AiListFieldContext_fieldId_contextFieldId_key" ON "AiListFieldContext"("fieldId", "contextFieldId");
