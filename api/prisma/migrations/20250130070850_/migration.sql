/*
  Warnings:

  - You are about to drop the column `external_id_from_file` on the `customers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_id,external_customer_id_from_file]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_customer_id_from_file` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `customers_file_id_external_id_from_file_key` ON `customers`;

-- AlterTable
ALTER TABLE `customers` DROP COLUMN `external_id_from_file`,
    ADD COLUMN `external_customer_id_from_file` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `customers_file_id_external_customer_id_from_file_key` ON `customers`(`file_id`, `external_customer_id_from_file`);
