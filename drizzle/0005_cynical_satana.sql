CREATE TABLE `challengeParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`userId` int NOT NULL,
	`currentProgress` int NOT NULL DEFAULT 0,
	`isCompleted` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challengeParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleZh` varchar(256) NOT NULL,
	`titleEn` varchar(256) NOT NULL,
	`descriptionZh` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`challengeType` enum('quest_count','streak','xp_gain','video_submit') NOT NULL,
	`targetValue` int NOT NULL,
	`xpReward` int NOT NULL DEFAULT 100,
	`badgeId` varchar(64),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practiceReminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`reminderTime` varchar(5) NOT NULL DEFAULT '19:00',
	`daysOfWeek` varchar(20) NOT NULL DEFAULT '0,1,2,3,4,5,6',
	`timezoneOffset` int NOT NULL DEFAULT 480,
	`lastReminderSent` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `practiceReminders_id` PRIMARY KEY(`id`),
	CONSTRAINT `practiceReminders_userId_unique` UNIQUE(`userId`)
);
