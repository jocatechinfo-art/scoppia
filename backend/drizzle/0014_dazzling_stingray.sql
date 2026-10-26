ALTER TABLE `customers` ADD `source` text DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `admin_version` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `entry_source` text DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `entry_actor` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `entry_fingerprint` text;