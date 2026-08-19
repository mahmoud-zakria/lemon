CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80),
	`entityId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driverOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`driverId` int NOT NULL,
	`status` enum('PENDING','ACCEPTED','REJECTED','EXPIRED') NOT NULL DEFAULT 'PENDING',
	`expiresAt` timestamp NOT NULL,
	`respondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driverOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driver_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nationalIdLast4` varchar(4),
	`driverStatus` enum('OFFLINE','ONLINE','BUSY') NOT NULL DEFAULT 'OFFLINE',
	`rating` decimal(3,2) NOT NULL DEFAULT '5.00',
	`totalTrips` int NOT NULL DEFAULT 0,
	`totalEarnings` decimal(12,2) NOT NULL DEFAULT '0.00',
	`isVerified` boolean NOT NULL DEFAULT false,
	`currentLat` decimal(10,7),
	`currentLng` decimal(10,7),
	`lastLocationAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driver_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `driver_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `orderStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`fromStatus` varchar(40),
	`toStatus` varchar(40) NOT NULL,
	`changedByUserId` int NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`driverId` int,
	`serviceAreaId` int,
	`status` enum('PENDING','SEARCHING_DRIVER','DRIVER_ASSIGNED','DRIVER_GOING_TO_PICKUP','ARRIVED_AT_PICKUP','ORDER_PICKED_UP','IN_DELIVERY','ARRIVED_AT_DESTINATION','DELIVERED','COMPLETED','CANCELLED','FAILED_DELIVERY') NOT NULL DEFAULT 'PENDING',
	`pickupAddress` varchar(500) NOT NULL,
	`pickupLat` decimal(10,7),
	`pickupLng` decimal(10,7),
	`dropoffAddress` varchar(500) NOT NULL,
	`dropoffLat` decimal(10,7),
	`dropoffLng` decimal(10,7),
	`packageCategory` varchar(80) NOT NULL DEFAULT 'PARCEL',
	`packageDescription` text NOT NULL,
	`weightKg` decimal(8,2) NOT NULL,
	`vehicleType` enum('MOTORCYCLE','TUKTUK','CAR','VAN','PICKUP_TRUCK') NOT NULL,
	`estimatedDistanceKm` decimal(8,2),
	`estimatedFare` decimal(10,2),
	`finalFare` decimal(10,2),
	`paymentMethod` enum('CASH_ON_DELIVERY','ONLINE') NOT NULL DEFAULT 'CASH_ON_DELIVERY',
	`paymentStatus` enum('UNPAID','PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'UNPAID',
	`driverOfferExpiresAt` timestamp,
	`cancelledReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`vehicleType` enum('MOTORCYCLE','TUKTUK','CAR','VAN','PICKUP_TRUCK'),
	`baseFare` decimal(10,2) NOT NULL DEFAULT '0.00',
	`perKm` decimal(10,2) NOT NULL DEFAULT '0.00',
	`minimumFare` decimal(10,2) NOT NULL DEFAULT '0.00',
	`waitingPerMinute` decimal(10,2) NOT NULL DEFAULT '0.00',
	`extraWeightThresholdKg` decimal(8,2),
	`extraWeightFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`customerId` int NOT NULL,
	`driverId` int NOT NULL,
	`score` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ratings_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `service_areas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`centerLat` decimal(10,7),
	`centerLng` decimal(10,7),
	`radiusKm` decimal(8,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_areas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`vehicleType` enum('MOTORCYCLE','TUKTUK','CAR','VAN','PICKUP_TRUCK') NOT NULL,
	`make` varchar(100),
	`model` varchar(100),
	`plateNumber` varchar(50),
	`capacityKg` decimal(8,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(150);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','CUSTOMER','DRIVER') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `accountStatus` enum('ACTIVE','SUSPENDED','PENDING','DELETED') DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverOffers` ADD CONSTRAINT `driverOffers_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverOffers` ADD CONSTRAINT `driverOffers_driverId_driver_profiles_id_fk` FOREIGN KEY (`driverId`) REFERENCES `driver_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driver_profiles` ADD CONSTRAINT `driver_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderStatusHistory` ADD CONSTRAINT `orderStatusHistory_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderStatusHistory` ADD CONSTRAINT `orderStatusHistory_changedByUserId_users_id_fk` FOREIGN KEY (`changedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_driverId_driver_profiles_id_fk` FOREIGN KEY (`driverId`) REFERENCES `driver_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_serviceAreaId_service_areas_id_fk` FOREIGN KEY (`serviceAreaId`) REFERENCES `service_areas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_driverId_driver_profiles_id_fk` FOREIGN KEY (`driverId`) REFERENCES `driver_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_driverId_driver_profiles_id_fk` FOREIGN KEY (`driverId`) REFERENCES `driver_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `driver_offers_driver_status_idx` ON `driverOffers` (`driverId`,`status`);--> statement-breakpoint
CREATE INDEX `driver_offers_order_idx` ON `driverOffers` (`orderId`);--> statement-breakpoint
CREATE INDEX `driver_profiles_status_idx` ON `driver_profiles` (`driverStatus`);--> statement-breakpoint
CREATE INDEX `order_history_order_idx` ON `orderStatusHistory` (`orderId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orders_customer_idx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `orders_driver_idx` ON `orders` (`driverId`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `vehicles_driver_idx` ON `vehicles` (`driverId`);--> statement-breakpoint
CREATE INDEX `vehicles_type_idx` ON `vehicles` (`vehicleType`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`accountStatus`);