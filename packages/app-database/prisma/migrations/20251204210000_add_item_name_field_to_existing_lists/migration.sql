-- Add itemName field to existing lists that don't have it
-- This field displays the item name (first column for per_row, column name for per_column, etc.)

-- Insert itemName field for lists that have at least one source but no itemName field
-- Set order to -1 so it appears first, then we'll renumber all fields
INSERT INTO "AiListField" (
  "id",
  "createdAt",
  "listId",
  "name",
  "type",
  "order",
  "sourceType",
  "fileProperty"
)
SELECT
  gen_random_uuid(),
  NOW(),
  l.id,
  'Item Name',
  'string',
  -1,
  'file_property',
  'itemName'
FROM "AiList" l
WHERE EXISTS (
  -- List has at least one source
  SELECT 1 FROM "AiListSource" s WHERE s."listId" = l.id
)
AND NOT EXISTS (
  -- List doesn't already have itemName field
  SELECT 1 FROM "AiListField" f
  WHERE f."listId" = l.id
  AND f."fileProperty" = 'itemName'
);

-- Renumber all fields to ensure itemName (order -1) becomes order 0
-- and all other fields are shifted up
UPDATE "AiListField" f
SET "order" = sub.new_order
FROM (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "listId" ORDER BY "order") - 1 as new_order
  FROM "AiListField"
) sub
WHERE f.id = sub.id;
