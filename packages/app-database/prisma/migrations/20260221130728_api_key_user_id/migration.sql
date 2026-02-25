/*
  Warnings:

  - You are about to drop the column `apiToken` on the `AiLibrary` table. All the data in the column will be lost.
  - You are about to drop the column `libraryId` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `freeMessages` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `freeStorage` on the `UserProfile` table. All the data in the column will be lost.
  - Added the required column `userId` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey

DELETE FROM "ApiKey";
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_libraryId_fkey";

-- DropIndex
DROP INDEX "ApiKey_libraryId_idx";

-- AlterTable
ALTER TABLE "AiLibrary" DROP COLUMN "apiToken";

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "libraryId",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "freeMessages",
DROP COLUMN "freeStorage";

-- CreateIndex
CREATE INDEX "ApiKey_workspaceId_idx" ON "ApiKey"("workspaceId");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
