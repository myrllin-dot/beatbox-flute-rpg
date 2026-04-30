import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  /** 密碼雜湊（email 登入用） */
  passwordHash: varchar("passwordHash", { length: 128 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const activationCodes = mysqlTable("activationCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  usedBy: int("usedBy"),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
 
export type ActivationCode = typeof activationCodes.$inferSelect;
export type InsertActivationCode = typeof activationCodes.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  questId: varchar("questId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  parentId: int("parentId"),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const commentLikes = mysqlTable("commentLikes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

export const videoSubmissions = mysqlTable("videoSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  questId: varchar("questId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  videoUrl: text("videoUrl").notNull(),
  videoKey: varchar("videoKey", { length: 512 }).notNull(),
  title: varchar("title", { length: 256 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "needs_revision"]).default("pending").notNull(),
  score: int("score"),
  feedback: text("feedback"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoSubmission = typeof videoSubmissions.$inferSelect;
export type InsertVideoSubmission = typeof videoSubmissions.$inferInsert;

export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questId: varchar("questId", { length: 32 }).notNull(),
  progress: int("progress").default(0).notNull(),
  completed: int("completed").default(0).notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  completedStepIds: text("completedStepIds"),
  videoWatched: int("videoWatched").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  nameZh: varchar("nameZh", { length: 128 }).notNull(),
  nameEn: varchar("nameEn", { length: 128 }).notNull(),
  descriptionZh: text("descriptionZh"),
  descriptionEn: text("descriptionEn"),
  iconUrl: text("iconUrl"),
  xpReward: int("xpReward").default(0).notNull(),
  category: mysqlEnum("category", ["quest", "skill", "social", "special"]).default("quest").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["achievement", "quest_complete", "video_reviewed", "level_up"]).notNull(),
  titleZh: varchar("titleZh", { length: 256 }).notNull(),
  titleEn: varchar("titleEn", { length: 256 }).notNull(),
  messageZh: text("messageZh"),
  messageEn: text("messageEn"),
  relatedId: varchar("relatedId", { length: 64 }),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const dailyCheckIns = mysqlTable("dailyCheckIns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  checkInDate: varchar("checkInDate", { length: 10 }).notNull(),
  streakCount: int("streakCount").default(1).notNull(),
  xpEarned: int("xpEarned").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type InsertDailyCheckIn = typeof dailyCheckIns.$inferInsert;

export const communityPosts = mysqlTable("communityPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  questId: varchar("questId", { length: 32 }),
  postType: mysqlEnum("postType", ["experience", "question", "achievement", "encouragement"]).default("experience").notNull(),
  likes: int("likes").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

export const postComments = mysqlTable("postComments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

export const postLikes = mysqlTable("postLikes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

export const practiceReminders = mysqlTable("practiceReminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enabled: int("enabled").default(1).notNull(),
  reminderTime: varchar("reminderTime", { length: 5 }).default("19:00").notNull(),
  daysOfWeek: varchar("daysOfWeek", { length: 20 }).default("0,1,2,3,4,5,6").notNull(),
  timezoneOffset: int("timezoneOffset").default(480).notNull(),
  lastReminderSent: timestamp("lastReminderSent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PracticeReminder = typeof practiceReminders.$inferSelect;
export type InsertPracticeReminder = typeof practiceReminders.$inferInsert;

export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  titleZh: varchar("titleZh", { length: 256 }).notNull(),
  titleEn: varchar("titleEn", { length: 256 }).notNull(),
  descriptionZh: text("descriptionZh").notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  challengeType: mysqlEnum("challengeType", ["quest_count", "streak", "xp_gain", "video_submit"]).notNull(),
  targetValue: int("targetValue").notNull(),
  xpReward: int("xpReward").default(100).notNull(),
  badgeId: varchar("badgeId", { length: 64 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

export const challengeParticipants = mysqlTable("challengeParticipants", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  userId: int("userId").notNull(),
  currentProgress: int("currentProgress").default(0).notNull(),
  isCompleted: int("isCompleted").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = typeof challengeParticipants.$inferInsert;

export const skillPrerequisites = mysqlTable("skillPrerequisites", {
  id: int("id").autoincrement().primaryKey(),
  skillId: varchar("skillId", { length: 32 }).notNull(),
  prerequisiteId: varchar("prerequisiteId", { length: 32 }).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
});

export type SkillPrerequisite = typeof skillPrerequisites.$inferSelect;
export type InsertSkillPrerequisite = typeof skillPrerequisites.$inferInsert;

export const userSkillProgress = mysqlTable("userSkillProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skillId: varchar("skillId", { length: 32 }).notNull(),
  masteryLevel: int("masteryLevel").default(0).notNull(),
  practiceCount: int("practiceCount").default(0).notNull(),
  lastPracticed: timestamp("lastPracticed"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSkillProgress = typeof userSkillProgress.$inferSelect;
export type InsertUserSkillProgress = typeof userSkillProgress.$inferInsert;

export const bookingSlots = mysqlTable("bookingSlots", {
  id: int("id").autoincrement().primaryKey(),
  instructorId: int("instructorId").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  duration: int("duration").default(30).notNull(),
  isAvailable: int("isAvailable").default(1).notNull(),
  price: int("price").default(0).notNull(),
  meetingLink: varchar("meetingLink", { length: 512 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookingSlot = typeof bookingSlots.$inferSelect;
export type InsertBookingSlot = typeof bookingSlots.$inferInsert;

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  slotId: int("slotId").notNull(),
  studentId: int("studentId").notNull(),
  instructorId: int("instructorId").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  topic: text("topic"),
  studentNotes: text("studentNotes"),
  instructorNotes: text("instructorNotes"),
  rating: int("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
