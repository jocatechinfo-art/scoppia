CREATE TABLE `delivery_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`cep_start` text NOT NULL,
	`cep_end` text NOT NULL,
	`fee_cents` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `delivery_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`item_key` text NOT NULL,
	`lot_id` text,
	`order_id` text,
	`kind` text NOT NULL,
	`delta` integer NOT NULL,
	`actor` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inventory_movements_created` ON `inventory_movements` (`created_at`);--> statement-breakpoint
CREATE TABLE `order_checks` (
	`order_id` text PRIMARY KEY NOT NULL,
	`items_checked` text DEFAULT '[]' NOT NULL,
	`address_checked` integer DEFAULT false NOT NULL,
	`package_checked` integer DEFAULT false NOT NULL,
	`actor` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_lot_allocations` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`item_key` text NOT NULL,
	`lot_id` text NOT NULL,
	`qty` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lot_id`) REFERENCES `stock_lots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stock_lot_allocations_lot` ON `stock_lot_allocations` (`lot_id`);--> statement-breakpoint
CREATE INDEX `stock_lot_allocations_order` ON `stock_lot_allocations` (`order_id`);--> statement-breakpoint
CREATE TABLE `stock_lots` (
	`id` text PRIMARY KEY NOT NULL,
	`item_key` text NOT NULL,
	`code` text NOT NULL,
	`produced_on` text NOT NULL,
	`expires_on` text NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `stock_lots_item_expiry` ON `stock_lots` (`item_key`,`expires_on`);--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_fee_cents` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_rule` text;