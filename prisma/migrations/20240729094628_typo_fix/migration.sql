/*
  Warnings:

  - You are about to drop the column `adddress` on the `hospitals` table. All the data in the column will be lost.
  - Added the required column `address` to the `hospitals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hospitals` DROP COLUMN `adddress`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `appointements` ADD CONSTRAINT `appointements_doctorSlotId_fkey` FOREIGN KEY (`doctorSlotId`) REFERENCES `doctorSlots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
