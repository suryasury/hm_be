-- AlterTable
ALTER TABLE `ailment` ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `documentTypes` ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false;
