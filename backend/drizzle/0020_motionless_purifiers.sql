CREATE TABLE `cart_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`items` text NOT NULL,
	`converted_order_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cart_snapshots_updated` ON `cart_snapshots` (`updated_at`);