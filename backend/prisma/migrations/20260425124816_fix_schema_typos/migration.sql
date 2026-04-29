/*
  Warnings:

  - You are about to alter the column `handshakePin` on the `Delivery` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NOT_APPLIED', 'PENDING_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'REJECTED_POST_INTERVIEW');

-- AlterTable
ALTER TABLE "Delivery" ALTER COLUMN "handshakePin" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
ADD COLUMN     "aiFaceMatchScore" DOUBLE PRECISION,
ADD COLUMN     "aiIdCardReal" BOOLEAN,
ADD COLUMN     "aiVerificationFlag" BOOLEAN,
ADD COLUMN     "applicatinStatus" "ApplicationStatus" NOT NULL DEFAULT 'NOT_APPLIED',
ADD COLUMN     "applicationSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "interviewLink" VARCHAR(500),
ADD COLUMN     "interviewScheduledAt" TIMESTAMP(3),
ADD COLUMN     "reasonToJoin" TEXT,
ADD COLUMN     "rejectionReason" TEXT;
