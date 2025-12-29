-- Rename useMarkdown to useVectorStore in AiListField table
-- This preserves all existing data using PostgreSQL's RENAME COLUMN command

ALTER TABLE "AiListField" RENAME COLUMN "useMarkdown" TO "useVectorStore";