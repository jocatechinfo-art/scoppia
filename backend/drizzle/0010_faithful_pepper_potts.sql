CREATE TABLE `production_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`item_key` text NOT NULL,
	`ready_qty` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `production_progress_order` ON `production_progress` (`order_id`);