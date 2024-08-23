/*
  Warnings:

  - A unique constraint covering the columns `[doctorSlotId,date,hospitalId]` on the table `tokenNumberTrackers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `tokenNumberTrackers_doctorSlotId_date_hospitalId_key` ON `tokenNumberTrackers`(`doctorSlotId`, `date`, `hospitalId`);
