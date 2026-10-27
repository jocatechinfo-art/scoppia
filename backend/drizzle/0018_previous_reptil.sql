CREATE TABLE `order_profits` (
	`order_id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`fingerprint` text NOT NULL,
	`inputs` text NOT NULL,
	`snapshot` text NOT NULL,
	`actor` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
