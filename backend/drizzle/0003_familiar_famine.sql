CREATE TABLE `menu_price_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_email` text NOT NULL,
	`created_at` text NOT NULL,
	`scope` text NOT NULL,
	`from_cents` integer NOT NULL,
	`to_cents` integer NOT NULL,
	`changed_count` integer NOT NULL,
	`details` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `menu_price_state` (
	`id` text PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`last_batch_id` text
);
--> statement-breakpoint
CREATE TABLE `menu_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`size_index` integer NOT NULL,
	`cents` integer NOT NULL
);
