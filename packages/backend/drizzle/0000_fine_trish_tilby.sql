CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `colors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hex` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`discounted_price` integer NOT NULL,
	`percentage_discount` integer DEFAULT 0 NOT NULL,
	`color_id` text,
	`size_id` text,
	`image_url` text NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`size_id`) REFERENCES `sizes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sizes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`value` text NOT NULL
);
