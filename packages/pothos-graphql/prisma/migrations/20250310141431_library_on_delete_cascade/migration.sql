-- DropForeignKey
ALTER TABLE "AiLibraryFile" DROP CONSTRAINT "AiLibraryFile_libraryId_fkey";

-- AddForeignKey
ALTER TABLE "AiLibraryFile" ADD CONSTRAINT "AiLibraryFile_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
