-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
