/*
  Warnings:

  - You are about to drop the column `medicationDosage` on the `patientPrescription` table. All the data in the column will be lost.
  - You are about to drop the column `medicationName` on the `patientPrescription` table. All the data in the column will be lost.
  - Added the required column `medicationStockId` to the `patientPrescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patientPrescription` DROP COLUMN `medicationDosage`,
    DROP COLUMN `medicationName`,
    ADD COLUMN `medicationStockId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `appointmentFeedbacks` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `appointmentId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `hospitalId` VARCHAR(191) NOT NULL,
    `overallSatisfaction` INTEGER NOT NULL,
    `feedBackRemarks` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicationStocks` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `medicationName` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `expirationDate` DATETIME(3) NOT NULL,
    `dosageForm` ENUM('Tablet', 'Capsule', 'Powder', 'Ointment', 'Cream', 'Gel', 'Syrup', 'Pastes', 'Granules', 'Pellets', 'Lozenges', 'Elixirs', 'Tinctures', 'Liniments') NOT NULL,
    `medicationDosage` VARCHAR(191) NOT NULL,
    `hospitalId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patientPrescription` ADD CONSTRAINT `patientPrescription_medicationStockId_fkey` FOREIGN KEY (`medicationStockId`) REFERENCES `medicationStocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointmentFeedbacks` ADD CONSTRAINT `appointmentFeedbacks_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointmentFeedbacks` ADD CONSTRAINT `appointmentFeedbacks_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointmentFeedbacks` ADD CONSTRAINT `appointmentFeedbacks_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicationStocks` ADD CONSTRAINT `medicationStocks_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
