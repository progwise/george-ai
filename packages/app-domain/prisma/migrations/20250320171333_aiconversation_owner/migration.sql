-- AlterTable
ALTER TABLE "AiConversation" ADD COLUMN "ownerId" TEXT;

-- Update conversations with a valid participant
UPDATE "AiConversation" c
SET "ownerId" = (
  SELECT p."userId"
  FROM "AiConversationParticipant" p
  WHERE p."conversationId" = c.id
    AND p."userId" IS NOT NULL
  ORDER BY p."createdAt" ASC
  LIMIT 1
);

-- Delete orphaned conversations
DELETE FROM "AiConversation" WHERE "ownerId" IS NULL;

-- Then set the NOT NULL constraint
ALTER TABLE "AiConversation" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
