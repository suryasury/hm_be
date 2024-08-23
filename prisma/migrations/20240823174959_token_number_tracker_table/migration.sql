-- CreateTable
CREATE TABLE `tokenNumberTrackers` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `doctorSlotId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `currentValue` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `hospitalId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tokenNumberTrackers_doctorSlotId_date_key`(`doctorSlotId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tokenNumberTrackers` ADD CONSTRAINT `tokenNumberTrackers_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `hospitals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokenNumberTrackers` ADD CONSTRAINT `tokenNumberTrackers_doctorSlotId_fkey` FOREIGN KEY (`doctorSlotId`) REFERENCES `doctorSlots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
