-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "accountName" VARCHAR(255),
ADD COLUMN     "accountNumber" VARCHAR(20),
ADD COLUMN     "bankCode" VARCHAR(20),
ADD COLUMN     "bankDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bankName" VARCHAR(100);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastPayoutAt" TIMESTAMP(3);
