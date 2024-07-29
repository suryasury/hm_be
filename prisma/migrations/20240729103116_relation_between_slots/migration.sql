/*
  Warnings:

  - Added the required column `hospitalId` to the `slots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `slots` ADD COLUMN `hospitalId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `slots` ADD CONSTRAINT `slots_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
