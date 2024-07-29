/*
  Warnings:

  - You are about to drop the `features` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roleFeatures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `roleFeatures` DROP FOREIGN KEY `roleFeatures_featureId_fkey`;

-- DropForeignKey
ALTER TABLE `roleFeatures` DROP FOREIGN KEY `roleFeatures_hospitalId_fkey`;

-- DropForeignKey
ALTER TABLE `roleFeatures` DROP FOREIGN KEY `roleFeatures_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `roles` DROP FOREIGN KEY `roles_hospitalId_fkey`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('ADMIN', 'DOCTOR') NOT NULL;

-- DropTable
DROP TABLE `features`;

-- DropTable
DROP TABLE `roleFeatures`;

-- DropTable
DROP TABLE `roles`;
