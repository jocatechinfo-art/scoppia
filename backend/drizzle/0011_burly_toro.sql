CREATE TABLE `inventory` (
	`item_key` text PRIMARY KEY NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_allocations` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`item_key` text NOT NULL,
	`qty` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stock_allocations_item` ON `stock_allocations` (`item_key`);--> statement-breakpoint
CREATE INDEX `stock_allocations_order` ON `stock_allocations` (`order_id`);--> statement-breakpoint
ALTER TABLE `orders` ADD `stock_batch_id` text;