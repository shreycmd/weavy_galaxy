/*
  Warnings:

  - Added the required column `updatedAt` to the `WorkFlowInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `WorkFlowInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkFlowInfo" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkFlowInfo" ADD CONSTRAINT "WorkFlowInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
