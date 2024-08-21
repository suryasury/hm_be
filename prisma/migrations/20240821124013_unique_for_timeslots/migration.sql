/*
  Warnings:

  - A unique constraint covering the columns `[startTime,endTime,hospitalId]` on the table `slots` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `slots_startTime_endTime_hospitalId_key` ON `slots`(`startTime`, `endTime`, `hospitalId`);
