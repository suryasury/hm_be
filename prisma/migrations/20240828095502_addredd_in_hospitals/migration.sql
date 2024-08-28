/*
  Warnings:

  - You are about to drop the column `address` on the `hospitals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hospitals` DROP COLUMN `address`,
    ADD COLUMN `address1` VARCHAR(191) NULL,
    ADD COLUMN `address2` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `houseNumber` VARCHAR(191) NULL,
    ADD COLUMN `pincode` VARCHAR(191) NULL,
    ADD COLUMN `state` VARCHAR(191) NULL;
