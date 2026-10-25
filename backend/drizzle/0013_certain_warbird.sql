CREATE TABLE `menu_costs` (
	`key` text PRIMARY KEY NOT NULL,
	`ingredients` text NOT NULL,
	`components` text NOT NULL,
	`packaging_cents` integer NOT NULL,
	`labor_cents` integer NOT NULL,
	`other_cents` integer NOT NULL,
	`version` text NOT NULL,
	`actor` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_commercial` (
	`order_id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`quote_id` text,
	`delivery_mode` text DEFAULT 'entrega' NOT NULL,
	`region` text DEFAULT '' NOT NULL,
	`driver` text DEFAULT '' NOT NULL,
	`sequence` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`method` text NOT NULL,
	`paid_on` text NOT NULL,
	`note` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_payments_order` ON `order_payments` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`lines` text NOT NULL,
	`shipping_cents` integer NOT NULL,
	`note` text NOT NULL,
	`status` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	`decided_at` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_quotes_order` ON `order_quotes` (`order_id`);