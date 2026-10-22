CREATE TABLE `bridge_codes` (
	`code_hash` text PRIMARY KEY NOT NULL,
	`challenge` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`full_name` text,
	`expires_at` integer NOT NULL
);
