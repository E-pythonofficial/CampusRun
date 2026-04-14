/*
  Warnings:

  - You are about to drop the column `distanceKm` on the `delivery` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `delivery` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - A unique constraint covering the columns `[paystackRef]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `distanceMeters` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropoffAddress` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropoffLat` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropoffLng` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupAddress` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupLat` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupLng` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `delivery` DROP COLUMN `distanceKm`,
    ADD COLUMN `distanceMeters` INTEGER NOT NULL,
    ADD COLUMN `dropoffAddress` TEXT NOT NULL,
    ADD COLUMN `dropoffLat` DOUBLE NOT NULL,
    ADD COLUMN `dropoffLng` DOUBLE NOT NULL,
    ADD COLUMN `paystackRef` VARCHAR(191) NULL,
    ADD COLUMN `pickupAddress` TEXT NOT NULL,
    ADD COLUMN `pickupLat` DOUBLE NOT NULL,
    ADD COLUMN `pickupLng` DOUBLE NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'PAID', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpires` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Otp` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Otp_email_key`(`email`),
    INDEX `Otp_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Delivery_paystackRef_key` ON `Delivery`(`paystackRef`);

-- CreateIndex
CREATE UNIQUE INDEX `User_resetToken_key` ON `User`(`resetToken`);

-- CreateIndex
CREATE INDEX `User_resetToken_idx` ON `User`(`resetToken`);
