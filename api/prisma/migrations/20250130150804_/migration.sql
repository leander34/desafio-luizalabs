-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_order_file_id_fkey` FOREIGN KEY (`order_file_id`) REFERENCES `order_files`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_order_file_id_fkey` FOREIGN KEY (`order_file_id`) REFERENCES `order_files`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
