CREATE TABLE `production_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`fingerprint` text NOT NULL,
	`item_key` text NOT NULL,
	`name` text NOT NULL,
	`size` text NOT NULL,
	`description` text NOT NULL,
	`quantity` integer NOT NULL,
	`allocated_qty` integer NOT NULL,
	`produced_on` text NOT NULL,
	`expires_on` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `production_runs_created` ON `production_runs` (`created_at`);