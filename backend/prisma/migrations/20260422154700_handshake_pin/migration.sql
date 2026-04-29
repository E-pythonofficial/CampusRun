/*
  Warnings:

  - You are about to drop the column `handoverPin` on the `Delivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "handoverPin",
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "handshakePin" TEXT;
