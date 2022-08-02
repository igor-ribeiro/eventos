/*
  Warnings:

  - You are about to drop the column `createdById` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `createdById`;

-- CreateTable
CREATE TABLE `_EventToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_EventToUser_AB_unique`(`A`, `B`),
    INDEX `_EventToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
