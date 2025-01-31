/*
  Warnings:

  - You are about to drop the column `product_id` on the `order_products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_id,external_id_from_file]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id_from_file,order_id,value]` on the table `order_products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[file_id,external_id_from_file]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_id_from_file` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id_from_file` to the `order_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id_from_file` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `order_products_product_id_order_id_value_key` ON `order_products`;

-- AlterTable
ALTER TABLE `customers` ADD COLUMN `external_id_from_file` INTEGER NOT NULL,
    ADD COLUMN `file_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `order_products` DROP COLUMN `product_id`,
    ADD COLUMN `external_id_from_file` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `external_id_from_file` INTEGER NOT NULL,
    ADD COLUMN `file_id` INTEGER NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `customers_file_id_external_id_from_file_key` ON `customers`(`file_id`, `external_id_from_file`);

-- CreateIndex
CREATE UNIQUE INDEX `order_products_external_id_from_file_order_id_value_key` ON `order_products`(`external_id_from_file`, `order_id`, `value`);

-- CreateIndex
CREATE INDEX `orders_date_idx` ON `orders`(`date`);

-- CreateIndex
CREATE UNIQUE INDEX `orders_file_id_external_id_from_file_key` ON `orders`(`file_id`, `external_id_from_file`);

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_customer_id_fkey` TO `orders_customer_id_idx`;
