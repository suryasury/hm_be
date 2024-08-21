/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,slotId,weekDaysId]` on the table `doctorSlots` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `doctorSlots_doctorId_slotId_weekDaysId_key` ON `doctorSlots`(`doctorId`, `slotId`, `weekDaysId`);
