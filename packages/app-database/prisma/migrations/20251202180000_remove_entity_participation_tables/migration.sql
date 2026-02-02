-- DropForeignKey
ALTER TABLE "AiAssistantParticipant" DROP CONSTRAINT "AiAssistantParticipant_assistantId_fkey";

-- DropForeignKey
ALTER TABLE "AiAssistantParticipant" DROP CONSTRAINT "AiAssistantParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "AiLibraryParticipant" DROP CONSTRAINT "AiLibraryParticipant_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "AiLibraryParticipant" DROP CONSTRAINT "AiLibraryParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "AiListParticipant" DROP CONSTRAINT "AiListParticipant_listId_fkey";

-- DropForeignKey
ALTER TABLE "AiListParticipant" DROP CONSTRAINT "AiListParticipant_userId_fkey";

-- DropTable
DROP TABLE "AiAssistantParticipant";

-- DropTable
DROP TABLE "AiLibraryParticipant";

-- DropTable
DROP TABLE "AiListParticipant";
