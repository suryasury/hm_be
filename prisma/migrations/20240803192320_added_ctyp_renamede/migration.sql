/*
  Warnings:

  - You are about to drop the column `documentContentType` on the `patientAppointmentDocs` table. All the data in the column will be lost.
  - You are about to drop the column `documentFileName` on the `patientAppointmentDocs` table. All the data in the column will be lost.
  - You are about to drop the column `documentMimeType` on the `patientAppointmentDocs` table. All the data in the column will be lost.
  - You are about to drop the column `documentPath` on the `patientAppointmentDocs` table. All the data in the column will be lost.
  - Added the required column `bucketPath` to the `patientAppointmentDocs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentType` to the `patientAppointmentDocs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileExtension` to the `patientAppointmentDocs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `patientAppointmentDocs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patientAppointmentDocs` DROP COLUMN `documentContentType`,
    DROP COLUMN `documentFileName`,
    DROP COLUMN `documentMimeType`,
    DROP COLUMN `documentPath`,
    ADD COLUMN `bucketPath` VARCHAR(191) NOT NULL,
    ADD COLUMN `contentType` VARCHAR(191) NOT NULL,
    ADD COLUMN `fileExtension` VARCHAR(191) NOT NULL,
    ADD COLUMN `fileName` VARCHAR(191) NOT NULL;
