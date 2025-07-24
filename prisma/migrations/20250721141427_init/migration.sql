/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cityId` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_userId_fkey`;

-- DropIndex
DROP INDEX `Event_categoryId_fkey` ON `Event`;

-- DropIndex
DROP INDEX `Event_userId_fkey` ON `Event`;

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `categoryId`,
    DROP COLUMN `date`,
    DROP COLUMN `description`,
    DROP COLUMN `title`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Location` ADD COLUMN `cityId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Category`;

-- CreateIndex
CREATE UNIQUE INDEX `City_name_key` ON `City`(`name`);

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
