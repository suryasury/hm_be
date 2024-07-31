/*
  Warnings:

  - You are about to drop the column `prescription_id` on the `prescriptionDays` table. All the data in the column will be lost.
  - Added the required column `prescriptionId` to the `prescriptionDays` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `prescriptionDays` DROP FOREIGN KEY `prescriptionDays_prescription_id_fkey`;

-- AlterTable
ALTER TABLE `prescriptionDays` DROP COLUMN `prescription_id`,
    ADD COLUMN `prescriptionId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `prescriptionDays` ADD CONSTRAINT `prescriptionDays_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `patientPrescription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
