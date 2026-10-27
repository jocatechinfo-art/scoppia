CREATE TABLE `order_edits` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`before_state` text NOT NULL,
	`after_state` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_edits_order_created` ON `order_edits` (`order_id`,`created_at`);