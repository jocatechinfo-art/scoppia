CREATE TABLE `stock_withdrawals` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`fingerprint` text NOT NULL,
	`item_key` text NOT NULL,
	`name` text NOT NULL,
	`size` text NOT NULL,
	`quantity` integer NOT NULL,
	`withdrawn_on` text NOT NULL,
	`reason` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `stock_withdrawals_created` ON `stock_withdrawals` (`created_at`);