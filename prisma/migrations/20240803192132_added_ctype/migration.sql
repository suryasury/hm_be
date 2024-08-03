/*
  Warnings:

  - Added the required column `documentContentType` to the `patientAppointmentDocs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patientAppointmentDocs` ADD COLUMN `documentContentType` VARCHAR(191) NOT NULL;
