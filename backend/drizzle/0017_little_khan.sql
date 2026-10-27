CREATE TABLE `shopping_purchases` (
	`shopping_id` text PRIMARY KEY NOT NULL,
	`supply_key` text NOT NULL,
	`quantity` text NOT NULL,
	`unit` text NOT NULL,
	`total_cents` integer NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`shopping_id`) REFERENCES `shopping_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `shopping_purchases_supply` ON `shopping_purchases` (`supply_key`);--> statement-breakpoint
ALTER TABLE `shopping_items` ADD `ingredient_key` text;