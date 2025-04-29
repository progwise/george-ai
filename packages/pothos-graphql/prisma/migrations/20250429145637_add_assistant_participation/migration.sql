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

-- AddForeignKey
ALTER TABLE "AiAssistantParticipant" ADD CONSTRAINT "AiAssistantParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
