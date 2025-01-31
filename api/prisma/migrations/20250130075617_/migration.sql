/*
  Warnings:

  - You are about to drop the column `external_id_from_file` on the `order_products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[external_product_id_from_file,order_id,value]` on the table `order_products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_product_id_from_file` to the `order_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `order_products_external_id_from_file_order_id_value_key` ON `order_products`;

-- AlterTable
ALTER TABLE `order_products` DROP COLUMN `external_id_from_file`,
    ADD COLUMN `external_product_id_from_file` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `order_products_external_product_id_from_file_order_id_value_key` ON `order_products`(`external_product_id_from_file`, `order_id`, `value`);
