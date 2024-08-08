/*
  Warnings:

  - You are about to drop the column `decease` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `ailmentId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentTypeId` to the `patientAppointmentDocs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointments` DROP COLUMN `decease`,
    ADD COLUMN `ailmentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `patientAppointmentDocs` ADD COLUMN `documentTypeId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ailment` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `hospitalId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentTypes` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `hospitalId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_ailmentId_fkey` FOREIGN KEY (`ailmentId`) REFERENCES `ailment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patientAppointmentDocs` ADD CONSTRAINT `patientAppointmentDocs_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `documentTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ailment` ADD CONSTRAINT `ailment_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentTypes` ADD CONSTRAINT `documentTypes_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
