/*
  Warnings:

  - You are about to drop the column `time_of_day` on the `prescriptionTimeOfDay` table. All the data in the column will be lost.
  - Added the required column `timeOfDay` to the `prescriptionTimeOfDay` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointments` MODIFY `appointmentStatus` ENUM('SCHEDULED', 'PENDING', 'COMPLETED', 'CANCELED', 'APPROVED') NOT NULL;

-- AlterTable
ALTER TABLE `patientPrescription` MODIFY `foodRelation` ENUM('BEFORE_MEAL', 'AFTER_MEAL', 'WITH_MEAL') NOT NULL;

-- AlterTable
ALTER TABLE `prescriptionTimeOfDay` DROP COLUMN `time_of_day`,
    ADD COLUMN `timeOfDay` VARCHAR(191) NOT NULL;
