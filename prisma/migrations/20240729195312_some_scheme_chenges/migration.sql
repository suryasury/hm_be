/*
  Warnings:

  - You are about to drop the `appointements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `appointements` DROP FOREIGN KEY `appointements_doctorId_fkey`;

-- DropForeignKey
ALTER TABLE `appointements` DROP FOREIGN KEY `appointements_doctorSlotId_fkey`;

-- DropForeignKey
ALTER TABLE `appointements` DROP FOREIGN KEY `appointements_hospitalId_fkey`;

-- DropForeignKey
ALTER TABLE `appointements` DROP FOREIGN KEY `appointements_patientId_fkey`;

-- DropTable
DROP TABLE `appointements`;

-- CreateTable
CREATE TABLE `appointments` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `doctorSlotId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `hospitalId` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `decease` VARCHAR(191) NULL,
    `appointmentDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctorSlotId_fkey` FOREIGN KEY (`doctorSlotId`) REFERENCES `doctorSlots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
