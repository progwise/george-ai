-- CreateTable
CREATE TABLE "AiLibraryCrawler" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "lastRun" TIMESTAMP(3),
    "maxDepth" INTEGER NOT NULL,
    "maxPages" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiLibraryCrawler_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiLibraryCrawler" ADD CONSTRAINT "AiLibraryCrawler_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
