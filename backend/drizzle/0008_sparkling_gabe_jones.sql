CREATE TABLE `order_numbers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_numbers_request_id_unique` ON `order_numbers` (`request_id`);--> statement-breakpoint
ALTER TABLE `orders` ADD `order_number` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);