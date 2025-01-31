/*
  Warnings:

  - You are about to drop the column `external_id_from_file` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_id,external_order_id_from_file]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_order_id_from_file` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `orders_file_id_external_id_from_file_key` ON `orders`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `external_id_from_file`,
    ADD COLUMN `external_order_id_from_file` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `orders_file_id_external_order_id_from_file_key` ON `orders`(`file_id`, `external_order_id_from_file`);
