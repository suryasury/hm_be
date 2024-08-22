-- AlterTable
ALTER TABLE `appointments` ADD COLUMN `bloodPreassure` VARCHAR(191) NULL,
    ADD COLUMN `feverLevel` VARCHAR(191) NULL,
    ADD COLUMN `otherVitalRemarks` VARCHAR(191) NULL,
    ADD COLUMN `patientWeight` VARCHAR(191) NULL,
    ADD COLUMN `pulse` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `patientPrescription` ADD COLUMN `prescriptionRemarks` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `qualification` VARCHAR(191) NULL;
