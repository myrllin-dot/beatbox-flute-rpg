import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Comments table for quest discussions
 * Stores user comments on tutorial videos/quests
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  /** The quest ID this comment belongs to (e.g., "1-1", "1-2") */
  questId: varchar("questId", { length: 32 }).notNull(),
  /** Reference to the user who posted this comment */
  userId: int("userId").notNull(),
  /** The comment content */
  content: text("content").notNull(),
  /** Parent comment ID for replies (null for top-level comments) */
  parentId: int("parentId"),
  /** Number of likes on this comment */
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Comment likes table to track which users liked which comments
 */
export const commentLikes = mysqlTable("commentLikes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;


/**
 * Video submissions table for student practice videos
 * Stores uploaded practice videos for instructor review
 */
export const videoSubmissions = mysqlTable("videoSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  /** The quest ID this submission belongs to */
  questId: varchar("questId", { length: 32 }).notNull(),
  /** Reference to the student who submitted */
  userId: int("userId").notNull(),
  /** Video file URL (stored in S3) */
  videoUrl: text("videoUrl").notNull(),
  /** S3 file key for the video */
  videoKey: varchar("videoKey", { length: 512 }).notNull(),
  /** Optional title for the submission */
  title: varchar("title", { length: 256 }),
  /** Optional description or notes from student */
  description: text("description"),
  /** Submission status: pending, approved, rejected, needs_revision */
  status: mysqlEnum("status", ["pending", "approved", "rejected", "needs_revision"]).default("pending").notNull(),
  /** Instructor's score (0-100) */
  score: int("score"),
  /** Instructor's feedback */
  feedback: text("feedback"),
  /** ID of the instructor who reviewed */
  reviewedBy: int("reviewedBy"),
  /** When the review was completed */
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoSubmission = typeof videoSubmissions.$inferSelect;
export type InsertVideoSubmission = typeof videoSubmissions.$inferInsert;


/**
 * User progress table to track quest completion and XP
 * Stores each user's progress on quests
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the user */
  userId: int("userId").notNull(),
  /** The quest ID that was completed */
  questId: varchar("questId", { length: 32 }).notNull(),
  /** Completion percentage (0-100) */
  progress: int("progress").default(0).notNull(),
  /** Whether the quest is fully completed */
  completed: int("completed").default(0).notNull(),
  /** XP earned from this quest */
  xpEarned: int("xpEarned").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * Achievements table to define available achievements
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique achievement code */
  code: varchar("code", { length: 64 }).notNull().unique(),
  /** Achievement name (Chinese) */
  nameZh: varchar("nameZh", { length: 128 }).notNull(),
  /** Achievement name (English) */
  nameEn: varchar("nameEn", { length: 128 }).notNull(),
  /** Description (Chinese) */
  descriptionZh: text("descriptionZh"),
  /** Description (English) */
  descriptionEn: text("descriptionEn"),
  /** Icon or badge image URL */
  iconUrl: text("iconUrl"),
  /** XP reward for earning this achievement */
  xpReward: int("xpReward").default(0).notNull(),
  /** Achievement category: quest, skill, social, special */
  category: mysqlEnum("category", ["quest", "skill", "social", "special"]).default("quest").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User achievements table to track earned achievements
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the user */
  userId: int("userId").notNull(),
  /** Reference to the achievement */
  achievementId: int("achievementId").notNull(),
  /** When the achievement was earned */
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Notifications table for user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the user */
  userId: int("userId").notNull(),
  /** Notification type: achievement, quest_complete, video_reviewed, level_up */
  type: mysqlEnum("type", ["achievement", "quest_complete", "video_reviewed", "level_up"]).notNull(),
  /** Notification title (Chinese) */
  titleZh: varchar("titleZh", { length: 256 }).notNull(),
  /** Notification title (English) */
  titleEn: varchar("titleEn", { length: 256 }).notNull(),
  /** Notification message (Chinese) */
  messageZh: text("messageZh"),
  /** Notification message (English) */
  messageEn: text("messageEn"),
  /** Related entity ID (achievement ID, quest ID, etc.) */
  relatedId: varchar("relatedId", { length: 64 }),
  /** Whether the notification has been read */
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
