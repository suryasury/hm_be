-- CreateTable
CREATE TABLE `postTreatmentDocuments` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `documentName` VARCHAR(191) NOT NULL,
    `bucketPath` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileExtension` VARCHAR(191) NOT NULL,
    `documentTypeId` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `postTreatmentDocuments` ADD CONSTRAINT `postTreatmentDocuments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postTreatmentDocuments` ADD CONSTRAINT `postTreatmentDocuments_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postTreatmentDocuments` ADD CONSTRAINT `postTreatmentDocuments_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `documentTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
