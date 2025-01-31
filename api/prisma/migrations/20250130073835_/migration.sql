/*
  Warnings:

  - You are about to drop the column `file_id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `file_id` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_file_id,external_customer_id_from_file]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_file_id,external_order_id_from_file]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_file_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_file_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `customers_file_id_external_customer_id_from_file_key` ON `customers`;

-- DropIndex
DROP INDEX `orders_file_id_external_order_id_from_file_key` ON `orders`;

-- AlterTable
ALTER TABLE `customers` DROP COLUMN `file_id`,
    ADD COLUMN `order_file_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `file_id`,
    ADD COLUMN `order_file_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `customers_order_file_id_external_customer_id_from_file_key` ON `customers`(`order_file_id`, `external_customer_id_from_file`);

-- CreateIndex
CREATE UNIQUE INDEX `orders_order_file_id_external_order_id_from_file_key` ON `orders`(`order_file_id`, `external_order_id_from_file`);
