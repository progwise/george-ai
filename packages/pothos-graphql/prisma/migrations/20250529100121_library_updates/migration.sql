-- CreateTable
CREATE TABLE "AiLibraryUpdate" (
    "id" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "fileId" TEXT,
    "crawlerRunId" TEXT,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLibraryUpdate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiLibraryUpdate" ADD CONSTRAINT "AiLibraryUpdate_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibraryUpdate" ADD CONSTRAINT "AiLibraryUpdate_crawlerRunId_fkey" FOREIGN KEY ("crawlerRunId") REFERENCES "AiLibraryCrawlerRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibraryUpdate" ADD CONSTRAINT "AiLibraryUpdate_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
