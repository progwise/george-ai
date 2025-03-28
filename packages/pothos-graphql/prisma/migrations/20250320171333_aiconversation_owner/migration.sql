/*
  Warnings:

  - Added the required column `ownerId` to the `AiConversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiConversation" ADD COLUMN     "ownerId" TEXT NOT NULL;

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
DELETE FROM "AiConversation"
WHERE id IN (
  SELECT c.id
  FROM "AiConversation" c
  LEFT JOIN (
    SELECT DISTINCT "conversationId"
    FROM "AiConversationParticipant"
    WHERE "userId" IS NOT NULL
  ) p ON c.id = p."conversationId"
  WHERE p."conversationId" IS NULL
);

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
