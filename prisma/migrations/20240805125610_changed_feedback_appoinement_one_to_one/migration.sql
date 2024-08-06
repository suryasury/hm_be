/*
  Warnings:

  - A unique constraint covering the columns `[appointmentId]` on the table `appointmentFeedbacks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `appointmentFeedbacks_appointmentId_key` ON `appointmentFeedbacks`(`appointmentId`);
