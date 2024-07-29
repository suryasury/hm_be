/*
  Warnings:

  - Added the required column `appointmentStatus` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointments` ADD COLUMN `appointmentStatus` ENUM('SCHEDULED', 'PENDING', 'COMPLETED', 'CANCELED') NOT NULL;
