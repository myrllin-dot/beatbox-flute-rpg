import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, comments, commentLikes, InsertComment, 
  videoSubmissions, InsertVideoSubmission,
  userProgress, InsertUserProgress,
  achievements, InsertAchievement,
  userAchievements, InsertUserAchievement,
  notifications, InsertNotification,
  dailyCheckIns, InsertDailyCheckIn,
  communityPosts, InsertCommunityPost,
  postComments, InsertPostComment,
  postLikes, InsertPostLike,
  practiceReminders, InsertPracticeReminder,
  challenges, InsertChallenge,
  challengeParticipants, InsertChallengeParticipant,
  skillPrerequisites, InsertSkillPrerequisite,
  userSkillProgress, InsertUserSkillProgress,
  bookingSlots, InsertBookingSlot,
  appointments, InsertAppointment
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Comment Functions ============

/**
 * Get all comments for a specific quest with user info
 */
export async function getCommentsByQuestId(questId: string, currentUserId?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get comments: database not available");
    return [];
  }

  // Get all comments for the quest
  const commentsResult = await db
    .select({
      id: comments.id,
      questId: comments.questId,
      userId: comments.userId,
      content: comments.content,
      parentId: comments.parentId,
      likes: comments.likes,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.questId, questId))
    .orderBy(desc(comments.createdAt));

  // If user is logged in, check which comments they've liked
  let likedCommentIds: number[] = [];
  if (currentUserId) {
    const likes = await db
      .select({ commentId: commentLikes.commentId })
      .from(commentLikes)
      .where(eq(commentLikes.userId, currentUserId));
    likedCommentIds = likes.map(l => l.commentId);
  }

  return commentsResult.map(c => ({
    ...c,
    isLikedByUser: likedCommentIds.includes(c.id),
  }));
}

/**
 * Create a new comment
 */
export async function createComment(data: {
  questId: string;
  userId: number;
  content: string;
  parentId?: number | null;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(comments).values({
    questId: data.questId,
    userId: data.userId,
    content: data.content,
    parentId: data.parentId ?? null,
    likes: 0,
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Delete a comment (only by owner or admin)
 */
export async function deleteComment(commentId: number, userId: number, isAdmin: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if user owns the comment or is admin
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId && !isAdmin) {
    throw new Error("Not authorized to delete this comment");
  }

  // Delete all replies first
  await db.delete(comments).where(eq(comments.parentId, commentId));
  
  // Delete the comment
  await db.delete(comments).where(eq(comments.id, commentId));

  // Delete associated likes
  await db.delete(commentLikes).where(eq(commentLikes.commentId, commentId));

  return { success: true };
}

/**
 * Toggle like on a comment
 */
export async function toggleCommentLike(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if already liked
  const [existingLike] = await db
    .select()
    .from(commentLikes)
    .where(and(
      eq(commentLikes.commentId, commentId),
      eq(commentLikes.userId, userId)
    ))
    .limit(1);

  if (existingLike) {
    // Unlike
    await db.delete(commentLikes).where(eq(commentLikes.id, existingLike.id));
    await db.update(comments)
      .set({ likes: sql`${comments.likes} - 1` })
      .where(eq(comments.id, commentId));
    return { liked: false };
  } else {
    // Like
    await db.insert(commentLikes).values({
      commentId,
      userId,
    });
    await db.update(comments)
      .set({ likes: sql`${comments.likes} + 1` })
      .where(eq(comments.id, commentId));
    return { liked: true };
  }
}

/**
 * Update a comment (only by owner)
 */
export async function updateComment(commentId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if user owns the comment
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error("Not authorized to edit this comment");
  }

  await db.update(comments)
    .set({ content })
    .where(eq(comments.id, commentId));

  return { success: true };
}


// ============ Video Submission Functions ============

/**
 * Create a new video submission
 */
export async function createVideoSubmission(data: {
  questId: string;
  userId: number;
  videoUrl: string;
  videoKey: string;
  title?: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(videoSubmissions).values({
    questId: data.questId,
    userId: data.userId,
    videoUrl: data.videoUrl,
    videoKey: data.videoKey,
    title: data.title ?? null,
    description: data.description ?? null,
    status: "pending",
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Get video submissions for a specific quest by a user
 */
export async function getUserSubmissionsForQuest(questId: string, userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(videoSubmissions)
    .where(and(
      eq(videoSubmissions.questId, questId),
      eq(videoSubmissions.userId, userId)
    ))
    .orderBy(desc(videoSubmissions.createdAt));
}

/**
 * Get all pending video submissions (for instructor review)
 */
export async function getPendingSubmissions() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select({
      id: videoSubmissions.id,
      questId: videoSubmissions.questId,
      userId: videoSubmissions.userId,
      videoUrl: videoSubmissions.videoUrl,
      videoKey: videoSubmissions.videoKey,
      title: videoSubmissions.title,
      description: videoSubmissions.description,
      status: videoSubmissions.status,
      score: videoSubmissions.score,
      feedback: videoSubmissions.feedback,
      reviewedBy: videoSubmissions.reviewedBy,
      reviewedAt: videoSubmissions.reviewedAt,
      createdAt: videoSubmissions.createdAt,
      updatedAt: videoSubmissions.updatedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(videoSubmissions)
    .leftJoin(users, eq(videoSubmissions.userId, users.id))
    .where(eq(videoSubmissions.status, "pending"))
    .orderBy(desc(videoSubmissions.createdAt));
}

/**
 * Get all video submissions (for instructor dashboard)
 */
export async function getAllSubmissions(status?: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const query = db
    .select({
      id: videoSubmissions.id,
      questId: videoSubmissions.questId,
      userId: videoSubmissions.userId,
      videoUrl: videoSubmissions.videoUrl,
      videoKey: videoSubmissions.videoKey,
      title: videoSubmissions.title,
      description: videoSubmissions.description,
      status: videoSubmissions.status,
      score: videoSubmissions.score,
      feedback: videoSubmissions.feedback,
      reviewedBy: videoSubmissions.reviewedBy,
      reviewedAt: videoSubmissions.reviewedAt,
      createdAt: videoSubmissions.createdAt,
      updatedAt: videoSubmissions.updatedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(videoSubmissions)
    .leftJoin(users, eq(videoSubmissions.userId, users.id));

  if (status && status !== 'all') {
    return await query
      .where(eq(videoSubmissions.status, status as "pending" | "approved" | "rejected" | "needs_revision"))
      .orderBy(desc(videoSubmissions.createdAt));
  }

  return await query.orderBy(desc(videoSubmissions.createdAt));
}

/**
 * Review a video submission (instructor only)
 */
export async function reviewSubmission(data: {
  submissionId: number;
  reviewerId: number;
  status: "approved" | "rejected" | "needs_revision";
  score?: number;
  feedback?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(videoSubmissions)
    .set({
      status: data.status,
      score: data.score ?? null,
      feedback: data.feedback ?? null,
      reviewedBy: data.reviewerId,
      reviewedAt: new Date(),
    })
    .where(eq(videoSubmissions.id, data.submissionId));

  return { success: true };
}

/**
 * Delete a video submission
 */
export async function deleteSubmission(submissionId: number, userId: number, isAdmin: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check ownership or admin
  const [submission] = await db
    .select()
    .from(videoSubmissions)
    .where(eq(videoSubmissions.id, submissionId))
    .limit(1);

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.userId !== userId && !isAdmin) {
    throw new Error("Not authorized to delete this submission");
  }

  await db.delete(videoSubmissions).where(eq(videoSubmissions.id, submissionId));

  return { success: true };
}


// ============ User Progress Functions ============

/**
 * Get or create user progress for a quest
 */
export async function getUserProgress(userId: number, questId: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [existing] = await db
    .select()
    .from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.questId, questId)
    ))
    .limit(1);

  return existing || null;
}

/**
 * Update user progress for a quest
 */
export async function updateUserProgress(data: {
  userId: number;
  questId: string;
  progress: number;
  completed?: boolean;
  xpEarned?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getUserProgress(data.userId, data.questId);

  if (existing) {
    await db.update(userProgress)
      .set({
        progress: data.progress,
        completed: data.completed ? 1 : existing.completed,
        xpEarned: data.xpEarned ?? existing.xpEarned,
        completedAt: data.completed ? new Date() : existing.completedAt,
      })
      .where(eq(userProgress.id, existing.id));
    return { id: existing.id, isNew: false };
  } else {
    const result = await db.insert(userProgress).values({
      userId: data.userId,
      questId: data.questId,
      progress: data.progress,
      completed: data.completed ? 1 : 0,
      xpEarned: data.xpEarned ?? 0,
      completedAt: data.completed ? new Date() : null,
    });
    return { id: Number(result[0].insertId), isNew: true };
  }
}

/**
 * Get all progress for a user
 */
export async function getAllUserProgress(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(userProgress.updatedAt));
}

/**
 * Get leaderboard data (top users by XP)
 */
export async function getLeaderboard(limit: number = 20) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  // Get total XP per user
  const result = await db
    .select({
      userId: userProgress.userId,
      userName: users.name,
      totalXp: sql<number>`SUM(${userProgress.xpEarned})`.as('totalXp'),
      completedQuests: sql<number>`SUM(${userProgress.completed})`.as('completedQuests'),
    })
    .from(userProgress)
    .leftJoin(users, eq(userProgress.userId, users.id))
    .groupBy(userProgress.userId, users.name)
    .orderBy(desc(sql`SUM(${userProgress.xpEarned})`))
    .limit(limit);

  return result;
}

/**
 * Get user rank in leaderboard
 */
export async function getUserRank(userId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  // Get all users ordered by XP
  const allUsers = await db
    .select({
      odUserId: userProgress.userId,
      totalXp: sql<number>`SUM(${userProgress.xpEarned})`.as('totalXp'),
    })
    .from(userProgress)
    .groupBy(userProgress.userId)
    .orderBy(desc(sql`SUM(${userProgress.xpEarned})`));

  const rank = allUsers.findIndex(u => u.odUserId === userId) + 1;
  const userStats = allUsers.find(u => u.odUserId === userId);

  return {
    rank: rank > 0 ? rank : null,
    totalXp: userStats?.totalXp ?? 0,
    totalUsers: allUsers.length,
  };
}

// ============ Achievement Functions ============

/**
 * Get all achievements
 */
export async function getAllAchievements() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(achievements);
}

/**
 * Get user's earned achievements
 */
export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select({
      id: userAchievements.id,
      achievementId: userAchievements.achievementId,
      earnedAt: userAchievements.earnedAt,
      code: achievements.code,
      nameZh: achievements.nameZh,
      nameEn: achievements.nameEn,
      descriptionZh: achievements.descriptionZh,
      descriptionEn: achievements.descriptionEn,
      iconUrl: achievements.iconUrl,
      xpReward: achievements.xpReward,
      category: achievements.category,
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.earnedAt));
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(userId: number, achievementCode: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get the achievement
  const [achievement] = await db
    .select()
    .from(achievements)
    .where(eq(achievements.code, achievementCode))
    .limit(1);

  if (!achievement) {
    throw new Error("Achievement not found");
  }

  // Check if already earned
  const [existing] = await db
    .select()
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievement.id)
    ))
    .limit(1);

  if (existing) {
    return { alreadyEarned: true, achievement };
  }

  // Award the achievement
  await db.insert(userAchievements).values({
    userId,
    achievementId: achievement.id,
  });

  return { alreadyEarned: false, achievement };
}

/**
 * Create a new achievement (admin only)
 */
export async function createAchievement(data: InsertAchievement) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(achievements).values(data);
  return { id: Number(result[0].insertId) };
}

// ============ Notification Functions ============

/**
 * Create a notification for a user
 */
export async function createNotification(data: {
  userId: number;
  type: "achievement" | "quest_complete" | "video_reviewed" | "level_up";
  titleZh: string;
  titleEn: string;
  messageZh?: string;
  messageEn?: string;
  relatedId?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    titleZh: data.titleZh,
    titleEn: data.titleEn,
    messageZh: data.messageZh ?? null,
    messageEn: data.messageEn ?? null,
    relatedId: data.relatedId ?? null,
    isRead: 0,
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const query = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  if (unreadOnly) {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, 0)
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  return await query;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(notifications)
    .set({ isRead: 1 })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));

  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.userId, userId));

  return { success: true };
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0)
    ));

  return result?.count ?? 0;
}


// ============ Daily Check-In Functions ============

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get yesterday's date string in YYYY-MM-DD format
 */
function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Check if user has already checked in today
 */
export async function hasCheckedInToday(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const today = getTodayDateString();
  const [existing] = await db
    .select()
    .from(dailyCheckIns)
    .where(and(
      eq(dailyCheckIns.userId, userId),
      eq(dailyCheckIns.checkInDate, today)
    ))
    .limit(1);

  return !!existing;
}

/**
 * Get user's current streak count
 */
export async function getUserStreak(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  // Get the most recent check-in
  const [lastCheckIn] = await db
    .select()
    .from(dailyCheckIns)
    .where(eq(dailyCheckIns.userId, userId))
    .orderBy(desc(dailyCheckIns.checkInDate))
    .limit(1);

  if (!lastCheckIn) {
    return 0;
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // If last check-in was today, return the streak
  if (lastCheckIn.checkInDate === today) {
    return lastCheckIn.streakCount;
  }

  // If last check-in was yesterday, streak continues
  if (lastCheckIn.checkInDate === yesterday) {
    return lastCheckIn.streakCount;
  }

  // Streak is broken
  return 0;
}

/**
 * Perform daily check-in for a user
 */
export async function performCheckIn(userId: number): Promise<{
  success: boolean;
  xpEarned: number;
  streakCount: number;
  isNewStreak: boolean;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const today = getTodayDateString();
  
  // Check if already checked in today
  const alreadyCheckedIn = await hasCheckedInToday(userId);
  if (alreadyCheckedIn) {
    const currentStreak = await getUserStreak(userId);
    return {
      success: false,
      xpEarned: 0,
      streakCount: currentStreak,
      isNewStreak: false,
    };
  }

  // Get current streak
  const currentStreak = await getUserStreak(userId);
  const newStreak = currentStreak + 1;

  // Calculate XP with streak bonus
  // Base: 10 XP, +5 XP per streak day (max bonus: 50 XP at 10+ days)
  const baseXp = 10;
  const streakBonus = Math.min(newStreak - 1, 10) * 5;
  const totalXp = baseXp + streakBonus;

  // Insert check-in record
  await db.insert(dailyCheckIns).values({
    userId,
    checkInDate: today,
    streakCount: newStreak,
    xpEarned: totalXp,
  });

  return {
    success: true,
    xpEarned: totalXp,
    streakCount: newStreak,
    isNewStreak: newStreak === 1,
  };
}

/**
 * Get user's check-in history for calendar display
 */
export async function getCheckInHistory(userId: number, days: number = 30): Promise<{
  date: string;
  streakCount: number;
  xpEarned: number;
}[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const result = await db
    .select({
      date: dailyCheckIns.checkInDate,
      streakCount: dailyCheckIns.streakCount,
      xpEarned: dailyCheckIns.xpEarned,
    })
    .from(dailyCheckIns)
    .where(and(
      eq(dailyCheckIns.userId, userId),
      sql`${dailyCheckIns.checkInDate} >= ${startDateStr}`
    ))
    .orderBy(desc(dailyCheckIns.checkInDate));

  return result.map(r => ({
    date: r.date,
    streakCount: r.streakCount,
    xpEarned: r.xpEarned,
  }));
}

/**
 * Get user's total check-in stats
 */
export async function getCheckInStats(userId: number): Promise<{
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  totalXpFromCheckIns: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalCheckIns: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXpFromCheckIns: 0,
    };
  }

  const [stats] = await db
    .select({
      totalCheckIns: sql<number>`COUNT(*)`,
      longestStreak: sql<number>`MAX(${dailyCheckIns.streakCount})`,
      totalXpFromCheckIns: sql<number>`SUM(${dailyCheckIns.xpEarned})`,
    })
    .from(dailyCheckIns)
    .where(eq(dailyCheckIns.userId, userId));

  const currentStreak = await getUserStreak(userId);

  return {
    totalCheckIns: stats?.totalCheckIns ?? 0,
    currentStreak,
    longestStreak: stats?.longestStreak ?? 0,
    totalXpFromCheckIns: stats?.totalXpFromCheckIns ?? 0,
  };
}


// ============ Community Post Functions ============

/**
 * Create a new community post
 */
export async function createCommunityPost(data: {
  userId: number;
  content: string;
  imageUrl?: string;
  questId?: string;
  postType?: "experience" | "question" | "achievement" | "encouragement";
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(communityPosts).values({
    userId: data.userId,
    content: data.content,
    imageUrl: data.imageUrl ?? null,
    questId: data.questId ?? null,
    postType: data.postType ?? "experience",
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Get community posts with pagination
 */
export async function getCommunityPosts(options: {
  limit?: number;
  offset?: number;
  postType?: string;
}) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  let query = db
    .select({
      id: communityPosts.id,
      userId: communityPosts.userId,
      content: communityPosts.content,
      imageUrl: communityPosts.imageUrl,
      questId: communityPosts.questId,
      postType: communityPosts.postType,
      likes: communityPosts.likes,
      commentCount: communityPosts.commentCount,
      createdAt: communityPosts.createdAt,
      updatedAt: communityPosts.updatedAt,
      userName: users.name,
      userRole: users.role,
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit)
    .offset(offset);

  if (options.postType && options.postType !== 'all') {
    return await db
      .select({
        id: communityPosts.id,
        userId: communityPosts.userId,
        content: communityPosts.content,
        imageUrl: communityPosts.imageUrl,
        questId: communityPosts.questId,
        postType: communityPosts.postType,
        likes: communityPosts.likes,
        commentCount: communityPosts.commentCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        userName: users.name,
        userRole: users.role,
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.userId, users.id))
      .where(eq(communityPosts.postType, options.postType as "experience" | "question" | "achievement" | "encouragement"))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  return await query;
}

/**
 * Get a single post by ID
 */
export async function getPostById(postId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [post] = await db
    .select({
      id: communityPosts.id,
      userId: communityPosts.userId,
      content: communityPosts.content,
      imageUrl: communityPosts.imageUrl,
      questId: communityPosts.questId,
      postType: communityPosts.postType,
      likes: communityPosts.likes,
      commentCount: communityPosts.commentCount,
      createdAt: communityPosts.createdAt,
      updatedAt: communityPosts.updatedAt,
      userName: users.name,
      userRole: users.role,
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .where(eq(communityPosts.id, postId))
    .limit(1);

  return post || null;
}

/**
 * Like or unlike a post
 */
export async function togglePostLike(postId: number, userId: number): Promise<{
  liked: boolean;
  newLikeCount: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if already liked
  const [existing] = await db
    .select()
    .from(postLikes)
    .where(and(
      eq(postLikes.postId, postId),
      eq(postLikes.userId, userId)
    ))
    .limit(1);

  if (existing) {
    // Unlike
    await db.delete(postLikes).where(eq(postLikes.id, existing.id));
    await db.update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} - 1` })
      .where(eq(communityPosts.id, postId));

    const [post] = await db.select({ likes: communityPosts.likes }).from(communityPosts).where(eq(communityPosts.id, postId));
    return { liked: false, newLikeCount: post?.likes ?? 0 };
  } else {
    // Like
    await db.insert(postLikes).values({ postId, userId });
    await db.update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, postId));

    const [post] = await db.select({ likes: communityPosts.likes }).from(communityPosts).where(eq(communityPosts.id, postId));
    return { liked: true, newLikeCount: post?.likes ?? 0 };
  }
}

/**
 * Check if user has liked a post
 */
export async function hasUserLikedPost(postId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const [existing] = await db
    .select()
    .from(postLikes)
    .where(and(
      eq(postLikes.postId, postId),
      eq(postLikes.userId, userId)
    ))
    .limit(1);

  return !!existing;
}

/**
 * Add a comment to a post
 */
export async function addPostComment(data: {
  postId: number;
  userId: number;
  content: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(postComments).values({
    postId: data.postId,
    userId: data.userId,
    content: data.content,
  });

  // Update comment count
  await db.update(communityPosts)
    .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
    .where(eq(communityPosts.id, data.postId));

  return { id: Number(result[0].insertId) };
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      userId: postComments.userId,
      content: postComments.content,
      createdAt: postComments.createdAt,
      userName: users.name,
      userRole: users.role,
    })
    .from(postComments)
    .leftJoin(users, eq(postComments.userId, users.id))
    .where(eq(postComments.postId, postId))
    .orderBy(postComments.createdAt);
}

/**
 * Delete a community post
 */
export async function deleteCommunityPost(postId: number, userId: number, isAdmin: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [post] = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== userId && !isAdmin) {
    throw new Error("Not authorized to delete this post");
  }

  // Delete likes and comments first
  await db.delete(postLikes).where(eq(postLikes.postId, postId));
  await db.delete(postComments).where(eq(postComments.postId, postId));
  await db.delete(communityPosts).where(eq(communityPosts.id, postId));

  return { success: true };
}



// ============ Practice Reminder Functions ============

/**
 * Get user's practice reminder settings
 */
export async function getPracticeReminder(userId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [reminder] = await db
    .select()
    .from(practiceReminders)
    .where(eq(practiceReminders.userId, userId))
    .limit(1);

  return reminder || null;
}

/**
 * Create or update practice reminder settings
 */
export async function upsertPracticeReminder(data: {
  userId: number;
  enabled?: boolean;
  reminderTime?: string;
  daysOfWeek?: string;
  timezoneOffset?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getPracticeReminder(data.userId);

  if (existing) {
    await db.update(practiceReminders)
      .set({
        enabled: data.enabled !== undefined ? (data.enabled ? 1 : 0) : existing.enabled,
        reminderTime: data.reminderTime ?? existing.reminderTime,
        daysOfWeek: data.daysOfWeek ?? existing.daysOfWeek,
        timezoneOffset: data.timezoneOffset ?? existing.timezoneOffset,
      })
      .where(eq(practiceReminders.id, existing.id));
    return { id: existing.id, isNew: false };
  } else {
    const result = await db.insert(practiceReminders).values({
      userId: data.userId,
      enabled: data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1,
      reminderTime: data.reminderTime ?? "19:00",
      daysOfWeek: data.daysOfWeek ?? "0,1,2,3,4,5,6",
      timezoneOffset: data.timezoneOffset ?? 480,
    });
    return { id: Number(result[0].insertId), isNew: true };
  }
}


// ============ Challenge Functions ============

/**
 * Get all active challenges
 */
export async function getActiveChallenges() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const now = new Date();
  
  return await db
    .select()
    .from(challenges)
    .where(and(
      eq(challenges.isActive, 1),
      sql`${challenges.startDate} <= ${now}`,
      sql`${challenges.endDate} >= ${now}`
    ))
    .orderBy(challenges.endDate);
}

/**
 * Get all challenges (including past ones)
 */
export async function getAllChallenges() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(challenges)
    .orderBy(desc(challenges.startDate));
}

/**
 * Get a challenge by ID
 */
export async function getChallengeById(challengeId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [challenge] = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);

  return challenge || null;
}

/**
 * Create a new challenge (admin only)
 */
export async function createChallenge(data: {
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  challengeType: "quest_count" | "streak" | "xp_gain" | "video_submit";
  targetValue: number;
  xpReward?: number;
  badgeId?: string;
  startDate: Date;
  endDate: Date;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(challenges).values({
    titleZh: data.titleZh,
    titleEn: data.titleEn,
    descriptionZh: data.descriptionZh,
    descriptionEn: data.descriptionEn,
    challengeType: data.challengeType,
    targetValue: data.targetValue,
    xpReward: data.xpReward ?? 100,
    badgeId: data.badgeId ?? null,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: 1,
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Join a challenge
 */
export async function joinChallenge(challengeId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if already joined
  const [existing] = await db
    .select()
    .from(challengeParticipants)
    .where(and(
      eq(challengeParticipants.challengeId, challengeId),
      eq(challengeParticipants.userId, userId)
    ))
    .limit(1);

  if (existing) {
    return { id: existing.id, alreadyJoined: true };
  }

  const result = await db.insert(challengeParticipants).values({
    challengeId,
    userId,
    currentProgress: 0,
    isCompleted: 0,
  });

  return { id: Number(result[0].insertId), alreadyJoined: false };
}

/**
 * Get user's participation in a challenge
 */
export async function getChallengeParticipation(challengeId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [participation] = await db
    .select()
    .from(challengeParticipants)
    .where(and(
      eq(challengeParticipants.challengeId, challengeId),
      eq(challengeParticipants.userId, userId)
    ))
    .limit(1);

  return participation || null;
}

/**
 * Get all challenges a user has joined
 */
export async function getUserChallenges(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select({
      participantId: challengeParticipants.id,
      challengeId: challengeParticipants.challengeId,
      currentProgress: challengeParticipants.currentProgress,
      isCompleted: challengeParticipants.isCompleted,
      completedAt: challengeParticipants.completedAt,
      joinedAt: challengeParticipants.joinedAt,
      titleZh: challenges.titleZh,
      titleEn: challenges.titleEn,
      descriptionZh: challenges.descriptionZh,
      descriptionEn: challenges.descriptionEn,
      challengeType: challenges.challengeType,
      targetValue: challenges.targetValue,
      xpReward: challenges.xpReward,
      badgeId: challenges.badgeId,
      startDate: challenges.startDate,
      endDate: challenges.endDate,
      isActive: challenges.isActive,
    })
    .from(challengeParticipants)
    .leftJoin(challenges, eq(challengeParticipants.challengeId, challenges.id))
    .where(eq(challengeParticipants.userId, userId))
    .orderBy(desc(challengeParticipants.joinedAt));
}

/**
 * Update challenge progress for a user
 */
export async function updateChallengeProgress(
  challengeId: number, 
  userId: number, 
  progressIncrement: number
): Promise<{ completed: boolean; newProgress: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const participation = await getChallengeParticipation(challengeId, userId);
  if (!participation) {
    return { completed: false, newProgress: 0 };
  }

  if (participation.isCompleted) {
    return { completed: true, newProgress: participation.currentProgress };
  }

  const challenge = await getChallengeById(challengeId);
  if (!challenge) {
    return { completed: false, newProgress: participation.currentProgress };
  }

  const newProgress = participation.currentProgress + progressIncrement;
  const isCompleted = newProgress >= challenge.targetValue;

  await db.update(challengeParticipants)
    .set({
      currentProgress: newProgress,
      isCompleted: isCompleted ? 1 : 0,
      completedAt: isCompleted ? new Date() : null,
    })
    .where(eq(challengeParticipants.id, participation.id));

  return { completed: isCompleted, newProgress };
}

/**
 * Get challenge leaderboard (top participants)
 */
export async function getChallengeLeaderboard(challengeId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select({
      participantId: challengeParticipants.id,
      userId: challengeParticipants.userId,
      currentProgress: challengeParticipants.currentProgress,
      isCompleted: challengeParticipants.isCompleted,
      completedAt: challengeParticipants.completedAt,
      userName: users.name,
    })
    .from(challengeParticipants)
    .leftJoin(users, eq(challengeParticipants.userId, users.id))
    .where(eq(challengeParticipants.challengeId, challengeId))
    .orderBy(desc(challengeParticipants.currentProgress), challengeParticipants.completedAt)
    .limit(limit);
}

/**
 * Delete a challenge (admin only)
 */
export async function deleteChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete participants first
  await db.delete(challengeParticipants).where(eq(challengeParticipants.challengeId, challengeId));
  await db.delete(challenges).where(eq(challenges.id, challengeId));

  return { success: true };
}


// ==================== Learning Path Functions ====================

/**
 * Get user's skill progress for all skills
 */
export async function getUserSkillProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(userSkillProgress).where(eq(userSkillProgress.userId, userId));
}

/**
 * Get or create user skill progress for a specific skill
 */
export async function getOrCreateUserSkillProgress(userId: number, skillId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await db.select()
    .from(userSkillProgress)
    .where(and(eq(userSkillProgress.userId, userId), eq(userSkillProgress.skillId, skillId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(userSkillProgress).values({
    userId,
    skillId,
    masteryLevel: 0,
    practiceCount: 0,
  });

  const created = await db.select()
    .from(userSkillProgress)
    .where(and(eq(userSkillProgress.userId, userId), eq(userSkillProgress.skillId, skillId)))
    .limit(1);

  return created[0];
}

/**
 * Update user skill progress
 */
export async function updateUserSkillProgress(
  userId: number,
  skillId: string,
  updates: { masteryLevel?: number; practiceCount?: number; notes?: string }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Ensure the record exists
  await getOrCreateUserSkillProgress(userId, skillId);

  const updateData: Record<string, unknown> = {};
  if (updates.masteryLevel !== undefined) updateData.masteryLevel = updates.masteryLevel;
  if (updates.practiceCount !== undefined) updateData.practiceCount = updates.practiceCount;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  updateData.lastPracticed = new Date();

  await db.update(userSkillProgress)
    .set(updateData)
    .where(and(eq(userSkillProgress.userId, userId), eq(userSkillProgress.skillId, skillId)));

  return { success: true };
}

/**
 * Get skill prerequisites
 */
export async function getSkillPrerequisites(skillId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(skillPrerequisites)
    .where(eq(skillPrerequisites.skillId, skillId))
    .orderBy(skillPrerequisites.orderIndex);
}

/**
 * Get all skill prerequisites (for building the skill tree)
 */
export async function getAllSkillPrerequisites() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(skillPrerequisites);
}

/**
 * Add a skill prerequisite
 */
export async function addSkillPrerequisite(skillId: string, prerequisiteId: string, orderIndex: number = 0) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(skillPrerequisites).values({
    skillId,
    prerequisiteId,
    orderIndex,
  });

  return { success: true };
}

// ==================== Booking Functions ====================

/**
 * Create a booking slot (instructor only)
 */
export async function createBookingSlot(slot: Omit<InsertBookingSlot, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(bookingSlots).values(slot);
  return { success: true, id: result[0].insertId };
}

/**
 * Get available booking slots
 */
export async function getAvailableBookingSlots(instructorId?: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  
  let query = db.select()
    .from(bookingSlots)
    .where(and(
      eq(bookingSlots.isAvailable, 1),
      sql`${bookingSlots.startTime} > ${now}`
    ))
    .orderBy(bookingSlots.startTime);

  if (instructorId) {
    query = db.select()
      .from(bookingSlots)
      .where(and(
        eq(bookingSlots.instructorId, instructorId),
        eq(bookingSlots.isAvailable, 1),
        sql`${bookingSlots.startTime} > ${now}`
      ))
      .orderBy(bookingSlots.startTime);
  }

  return query;
}

/**
 * Get instructor's all booking slots
 */
export async function getInstructorBookingSlots(instructorId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(bookingSlots)
    .where(eq(bookingSlots.instructorId, instructorId))
    .orderBy(desc(bookingSlots.startTime));
}

/**
 * Update a booking slot
 */
export async function updateBookingSlot(
  slotId: number,
  updates: { isAvailable?: number; meetingLink?: string; notes?: string; price?: number }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(bookingSlots).set(updates).where(eq(bookingSlots.id, slotId));
  return { success: true };
}

/**
 * Delete a booking slot
 */
export async function deleteBookingSlot(slotId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(bookingSlots).where(eq(bookingSlots.id, slotId));
  return { success: true };
}

/**
 * Book an appointment
 */
export async function createAppointment(appointment: Omit<InsertAppointment, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Mark the slot as unavailable
  await db.update(bookingSlots)
    .set({ isAvailable: 0 })
    .where(eq(bookingSlots.id, appointment.slotId));

  const result = await db.insert(appointments).values(appointment);
  return { success: true, id: result[0].insertId };
}

/**
 * Get student's appointments
 */
export async function getStudentAppointments(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: appointments.id,
    slotId: appointments.slotId,
    studentId: appointments.studentId,
    instructorId: appointments.instructorId,
    status: appointments.status,
    topic: appointments.topic,
    studentNotes: appointments.studentNotes,
    instructorNotes: appointments.instructorNotes,
    rating: appointments.rating,
    feedback: appointments.feedback,
    createdAt: appointments.createdAt,
    startTime: bookingSlots.startTime,
    endTime: bookingSlots.endTime,
    duration: bookingSlots.duration,
    meetingLink: bookingSlots.meetingLink,
    instructorName: users.name,
  })
    .from(appointments)
    .leftJoin(bookingSlots, eq(appointments.slotId, bookingSlots.id))
    .leftJoin(users, eq(appointments.instructorId, users.id))
    .where(eq(appointments.studentId, studentId))
    .orderBy(desc(bookingSlots.startTime));
}

/**
 * Get instructor's appointments
 */
export async function getInstructorAppointments(instructorId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: appointments.id,
    slotId: appointments.slotId,
    studentId: appointments.studentId,
    instructorId: appointments.instructorId,
    status: appointments.status,
    topic: appointments.topic,
    studentNotes: appointments.studentNotes,
    instructorNotes: appointments.instructorNotes,
    rating: appointments.rating,
    feedback: appointments.feedback,
    createdAt: appointments.createdAt,
    startTime: bookingSlots.startTime,
    endTime: bookingSlots.endTime,
    duration: bookingSlots.duration,
    meetingLink: bookingSlots.meetingLink,
    studentName: users.name,
    studentEmail: users.email,
  })
    .from(appointments)
    .leftJoin(bookingSlots, eq(appointments.slotId, bookingSlots.id))
    .leftJoin(users, eq(appointments.studentId, users.id))
    .where(eq(appointments.instructorId, instructorId))
    .orderBy(desc(bookingSlots.startTime));
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: number,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Record<string, unknown> = { status };
  if (notes) updateData.instructorNotes = notes;

  // If cancelled, make the slot available again
  if (status === 'cancelled') {
    const apt = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
    if (apt.length > 0) {
      await db.update(bookingSlots).set({ isAvailable: 1 }).where(eq(bookingSlots.id, apt[0].slotId));
    }
  }

  await db.update(appointments).set(updateData).where(eq(appointments.id, appointmentId));
  return { success: true };
}

/**
 * Rate an appointment (student)
 */
export async function rateAppointment(appointmentId: number, rating: number, feedback?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Record<string, unknown> = { rating };
  if (feedback) updateData.feedback = feedback;

  await db.update(appointments).set(updateData).where(eq(appointments.id, appointmentId));
  return { success: true };
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(appointmentId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: appointments.id,
    slotId: appointments.slotId,
    studentId: appointments.studentId,
    instructorId: appointments.instructorId,
    status: appointments.status,
    topic: appointments.topic,
    studentNotes: appointments.studentNotes,
    instructorNotes: appointments.instructorNotes,
    rating: appointments.rating,
    feedback: appointments.feedback,
    createdAt: appointments.createdAt,
    startTime: bookingSlots.startTime,
    endTime: bookingSlots.endTime,
    duration: bookingSlots.duration,
    meetingLink: bookingSlots.meetingLink,
  })
    .from(appointments)
    .leftJoin(bookingSlots, eq(appointments.slotId, bookingSlots.id))
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
