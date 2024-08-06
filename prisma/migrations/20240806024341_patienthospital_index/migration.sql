-- CreateTable
CREATE TABLE `hospitalPatients` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `hospitalId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,

    INDEX `hospitalPatients_hospitalId_patientId_idx`(`hospitalId`, `patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `patients_email_phoneNumber_idx` ON `patients`(`email`, `phoneNumber`);

-- CreateIndex
CREATE INDEX `users_email_phoneNumber_idx` ON `users`(`email`, `phoneNumber`);

-- AddForeignKey
ALTER TABLE `hospitalPatients` ADD CONSTRAINT `hospitalPatients_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hospitalPatients` ADD CONSTRAINT `hospitalPatients_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
