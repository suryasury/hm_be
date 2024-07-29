/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `patients_phoneNumber_key` ON `patients`(`phoneNumber`);
