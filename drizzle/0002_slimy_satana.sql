CREATE TABLE `videoSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`videoUrl` text NOT NULL,
	`videoKey` varchar(512) NOT NULL,
	`title` varchar(256),
	`description` text,
	`status` enum('pending','approved','rejected','needs_revision') NOT NULL DEFAULT 'pending',
	`score` int,
	`feedback` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoSubmissions_id` PRIMARY KEY(`id`)
);
