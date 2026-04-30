-- Add itemName column to AiListItem (nullable first for migration)
ALTER TABLE "public"."AiListItem" ADD COLUMN "itemName" TEXT;

-- Update existing items with itemName based on extraction strategy
-- For per_row: use first value from metadata.values array, or "Row {index}"
-- For per_column: use columnName from metadata
-- For llm_prompt: use itemName from metadata
-- For per_file or fallback: use file name
UPDATE "public"."AiListItem" AS item
SET "itemName" = COALESCE(
  -- Try to get itemName from metadata (for llm_prompt strategy)
  item.metadata->>'itemName',
  -- Try to get columnName from metadata (for per_column strategy)
  item.metadata->>'columnName',
  -- Try to get first value from metadata.values array (for per_row strategy)
  item.metadata->'values'->>0,
  -- Fallback: use file name
  (SELECT f.name FROM "public"."AiLibraryFile" f WHERE f.id = item."sourceFileId"),
  -- Ultimate fallback
  'Unknown Item'
);

-- Make itemName NOT NULL after populating
ALTER TABLE "public"."AiListItem" ALTER COLUMN "itemName" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AiListItem_itemName_idx" ON "public"."AiListItem"("itemName");
