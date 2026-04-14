/*
  Warnings:

  - You are about to alter the column `ipAddress` on the `loginrecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(45)`.
  - You are about to alter the column `code` on the `otp` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to alter the column `college` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `department` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `hostel` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `matricNumber` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `staffIdUsername` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `delivery` DROP FOREIGN KEY `Delivery_requesterId_fkey`;

-- DropIndex
DROP INDEX `Otp_email_key` ON `otp`;

-- AlterTable
ALTER TABLE `delivery` MODIFY `item` VARCHAR(255) NOT NULL,
    MODIFY `paystackRef` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `loginrecord` MODIFY `ipAddress` VARCHAR(45) NULL,
    MODIFY `userAgent` TEXT NULL;

-- AlterTable
ALTER TABLE `otp` MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `code` VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `idCardUrl` VARCHAR(500) NULL,
    ADD COLUMN `selfieUrl` VARCHAR(500) NULL,
    ADD COLUMN `username` VARCHAR(50) NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `fullName` VARCHAR(255) NOT NULL,
    MODIFY `college` VARCHAR(100) NULL,
    MODIFY `department` VARCHAR(100) NULL,
    MODIFY `hostel` VARCHAR(100) NULL,
    MODIFY `matricNumber` VARCHAR(50) NULL,
    MODIFY `staffIdUsername` VARCHAR(50) NULL,
    MODIFY `isApproved` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `verificationToken` VARCHAR(255) NULL,
    MODIFY `resetToken` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `Delivery_status_idx` ON `Delivery`(`status`);

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Delivery_requesterId_idx` ON `Delivery`(`requesterId`);
DROP INDEX `Delivery_requesterId_fkey` ON `delivery`;

-- RedefineIndex
CREATE INDEX `Delivery_runnerId_idx` ON `Delivery`(`runnerId`);
DROP INDEX `Delivery_runnerId_fkey` ON `delivery`;
