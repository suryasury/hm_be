/*
  Warnings:

  - Added the required column `isd_code` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isd_code` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hospitals` ADD COLUMN `isd_code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `patients` ADD COLUMN `isd_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isd_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `profilePictureUrl` VARCHAR(191) NULL,
    ADD COLUMN `speciality` VARCHAR(191) NULL;
