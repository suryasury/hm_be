-- AlterTable
ALTER TABLE `users` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
