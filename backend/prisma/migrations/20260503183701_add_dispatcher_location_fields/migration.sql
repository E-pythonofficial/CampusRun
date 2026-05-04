/*
  Warnings:

  - You are about to drop the column `accountName` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `bankCode` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `bankDetailsSubmitted` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Delivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "accountName",
DROP COLUMN "accountNumber",
DROP COLUMN "bankCode",
DROP COLUMN "bankDetailsSubmitted",
DROP COLUMN "bankName",
ADD COLUMN     "itemImageUrl" VARCHAR(500);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountName" VARCHAR(255),
ADD COLUMN     "accountNumber" VARCHAR(20),
ADD COLUMN     "bankCode" VARCHAR(20),
ADD COLUMN     "bankDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bankName" VARCHAR(100),
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLat" DOUBLE PRECISION,
ADD COLUMN     "lastLng" DOUBLE PRECISION,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_isOnline_idx" ON "User"("isOnline");
