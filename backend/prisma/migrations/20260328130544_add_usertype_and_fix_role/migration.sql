/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `userType` ENUM('STUDENT', 'STAFF') NOT NULL DEFAULT 'STUDENT',
    MODIFY `role` ENUM('REQUESTER', 'RUNNER', 'ADMIN') NOT NULL DEFAULT 'REQUESTER';
