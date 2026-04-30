-- CreateTable
CREATE TABLE "AiAssistantEUActAnswers" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assistantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT,
    "notes" TEXT,

    CONSTRAINT "AiAssistantEUActAnswers_pkey" PRIMARY KEY ("assistantId","questionId")
);

-- AddForeignKey
ALTER TABLE "AiAssistantEUActAnswers" ADD CONSTRAINT "AiAssistantEUActAnswers_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
