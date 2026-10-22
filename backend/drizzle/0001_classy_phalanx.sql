CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cpf_hash` text NOT NULL,
	`cpf_last` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_user_id_unique` ON `customers` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_cpf_hash_unique` ON `customers` (`cpf_hash`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`request_id` text NOT NULL,
	`items` text NOT NULL,
	`total_cents` integer NOT NULL,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`preferred_date` text NOT NULL,
	`notes` text NOT NULL,
	`status` text DEFAULT 'aguardando_confirmacao' NOT NULL,
	`delivery_date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_id_unique` ON `orders` (`request_id`);--> statement-breakpoint
CREATE INDEX `orders_customer_created` ON `orders` (`customer_id`,`created_at`);