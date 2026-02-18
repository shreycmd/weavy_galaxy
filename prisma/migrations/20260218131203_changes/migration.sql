/*
  Warnings:

  - You are about to drop the column `nodeId` on the `Connections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Connections" DROP CONSTRAINT "Connections_nodeId_fkey";

-- AlterTable
ALTER TABLE "Connections" DROP COLUMN "nodeId";
