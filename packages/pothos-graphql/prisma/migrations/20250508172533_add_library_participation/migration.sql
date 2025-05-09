-- CreateTable
CREATE TABLE "AiLibraryParticipant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "libraryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AiLibraryParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiLibraryParticipant_libraryId_userId_key" ON "AiLibraryParticipant"("libraryId", "userId");

-- AddForeignKey
ALTER TABLE "AiLibraryParticipant" ADD CONSTRAINT "AiLibraryParticipant_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Populate AiConversationParticipant with data from existing libraries
INSERT INTO "AiLibraryParticipant" ("libraryId", "userId")
SELECT
    l."id" AS "libraryId",
    l."ownerId" AS "userId"
FROM "AiLibrary" l;

-- AddForeignKey
ALTER TABLE "AiLibraryParticipant" ADD CONSTRAINT "AiLibraryParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
