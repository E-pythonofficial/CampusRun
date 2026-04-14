/*
  Warnings:

  - A unique constraint covering the columns `[matricNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffIdUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `fullName` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `college` VARCHAR(191) NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `hostel` VARCHAR(191) NULL,
    ADD COLUMN `matricNumber` VARCHAR(191) NULL,
    ADD COLUMN `staffIdUsername` VARCHAR(191) NULL,
    MODIFY `fullName` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_matricNumber_key` ON `User`(`matricNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `User_staffIdUsername_key` ON `User`(`staffIdUsername`);
