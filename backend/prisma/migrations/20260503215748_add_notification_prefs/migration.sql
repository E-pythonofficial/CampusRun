-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifDeliveryRequests" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifPayoutAlerts" BOOLEAN NOT NULL DEFAULT false;
