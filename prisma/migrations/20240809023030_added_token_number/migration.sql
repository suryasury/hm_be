/*
  Warnings:

  - Added the required column `tokenNumber` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointments` ADD COLUMN `tokenNumber` VARCHAR(191) NOT NULL;
