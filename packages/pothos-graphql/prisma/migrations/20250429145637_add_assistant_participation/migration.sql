-- CreateTable
CREATE TABLE "AiAssistantParticipant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assistantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AiAssistantParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiAssistantParticipant_assistantId_userId_key" ON "AiAssistantParticipant"("assistantId", "userId");

-- AddForeignKey
ALTER TABLE "AiAssistantParticipant" ADD CONSTRAINT "AiAssistantParticipant_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update assistants with a valid participant
UPDATE "AiAssistant" a
SET "ownerId" = (
  SELECT p."userId"
  FROM "AiAssistantParticipant" p
  WHERE p."assistantId" = a.id
    AND p."userId" IS NOT NULL
  ORDER BY p."createdAt" ASC
  LIMIT 1
);

-- AddForeignKey
ALTER TABLE "AiAssistantParticipant" ADD CONSTRAINT "AiAssistantParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
