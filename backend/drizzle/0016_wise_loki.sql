CREATE TABLE `shopping_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`quantity` text NOT NULL,
	`unit` text NOT NULL,
	`purchased` integer DEFAULT false NOT NULL,
	`purchased_at` text,
	`version` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
