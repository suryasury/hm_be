/*
  Warnings:

  - The values [CANCELED] on the enum `appointments_appointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `endTimeInDateTime` to the `slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTimeInDateTime` to the `slots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointments` MODIFY `appointmentStatus` ENUM('SCHEDULED', 'PENDING', 'COMPLETED', 'CANCELLED', 'APPROVED') NOT NULL;

-- AlterTable
ALTER TABLE `slots` ADD COLUMN `endTimeInDateTime` DATETIME(3) NOT NULL,
    ADD COLUMN `startTimeInDateTime` DATETIME(3) NOT NULL;
