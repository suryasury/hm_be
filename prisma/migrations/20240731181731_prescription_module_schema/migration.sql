-- AlterTable
ALTER TABLE `patients` ADD COLUMN `address1` VARCHAR(191) NULL,
    ADD COLUMN `address2` VARCHAR(191) NULL,
    ADD COLUMN `bloodGroup` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `houseNumber` VARCHAR(191) NULL,
    ADD COLUMN `pincode` VARCHAR(191) NULL,
    ADD COLUMN `state` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `patientPrescription` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `hospitalId` VARCHAR(191) NOT NULL,
    `medicationnName` VARCHAR(191) NOT NULL,
    `medicationDosage` VARCHAR(191) NOT NULL,
    `durationInDays` INTEGER NOT NULL,
    `foodRelation` ENUM('BEFORE_MEAL', 'AFTER_MEAL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescriptionDays` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `prescription_id` VARCHAR(191) NOT NULL,
    `prescriptionDate` DATETIME(3) NOT NULL,
    `isPrescriptionTakenForTheDay` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescriptionTimeOfDay` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `time_of_day` VARCHAR(191) NOT NULL,
    `isPrescriptionTaken` BOOLEAN NOT NULL DEFAULT false,
    `prescriptionDayId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patientPrescription` ADD CONSTRAINT `patientPrescription_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patientPrescription` ADD CONSTRAINT `patientPrescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patientPrescription` ADD CONSTRAINT `patientPrescription_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptionDays` ADD CONSTRAINT `prescriptionDays_prescription_id_fkey` FOREIGN KEY (`prescription_id`) REFERENCES `patientPrescription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptionTimeOfDay` ADD CONSTRAINT `prescriptionTimeOfDay_prescriptionDayId_fkey` FOREIGN KEY (`prescriptionDayId`) REFERENCES `prescriptionDays`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
