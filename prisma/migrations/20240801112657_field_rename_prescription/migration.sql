/*
  Warnings:

  - You are about to drop the column `medicationnName` on the `patientPrescription` table. All the data in the column will be lost.
  - Added the required column `medicationName` to the `patientPrescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patientPrescription` DROP COLUMN `medicationnName`,
    ADD COLUMN `medicationName` VARCHAR(191) NOT NULL;
