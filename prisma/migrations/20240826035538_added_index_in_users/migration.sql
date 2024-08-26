/*
  Warnings:

  - A unique constraint covering the columns `[email,hospitalId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `users_email_phoneNumber_idx` ON `users`;

-- CreateIndex
CREATE INDEX `users_phoneNumber_idx` ON `users`(`phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `users_email_hospitalId_key` ON `users`(`email`, `hospitalId`);
