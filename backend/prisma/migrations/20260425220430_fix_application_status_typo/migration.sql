/*
  Warnings:

  - You are about to drop the column `applicatinStatus` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "applicatinStatus",
ADD COLUMN     "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'NOT_APPLIED';
