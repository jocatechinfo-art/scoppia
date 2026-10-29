CREATE TABLE `packaging_links` (
	`id` text PRIMARY KEY NOT NULL,
	`target` text NOT NULL,
	`packaging_id` text NOT NULL,
	`qty` integer NOT NULL,
	`version` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`packaging_id`) REFERENCES `packaging_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `packaging_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`packaging_id` text NOT NULL,
	`kind` text NOT NULL,
	`delta` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`balance` integer NOT NULL,
	`note` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`packaging_id`) REFERENCES `packaging_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `packaging_movements_item` ON `packaging_movements` (`packaging_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `packaging_stock` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`unit_cost_cents` integer DEFAULT 0 NOT NULL,
	`version` text NOT NULL,
	`updated_at` text NOT NULL
);
