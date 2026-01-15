CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slotId` int NOT NULL,
	`studentId` int NOT NULL,
	`instructorId` int NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`topic` text,
	`studentNotes` text,
	`instructorNotes` text,
	`rating` int,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookingSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instructorId` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`duration` int NOT NULL DEFAULT 30,
	`isAvailable` int NOT NULL DEFAULT 1,
	`price` int NOT NULL DEFAULT 0,
	`meetingLink` varchar(512),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookingSlots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skillPrerequisites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skillId` varchar(32) NOT NULL,
	`prerequisiteId` varchar(32) NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	CONSTRAINT `skillPrerequisites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSkillProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillId` varchar(32) NOT NULL,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`practiceCount` int NOT NULL DEFAULT 0,
	`lastPracticed` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSkillProgress_id` PRIMARY KEY(`id`)
);
