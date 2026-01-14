import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, comments, commentLikes, InsertComment, 
  videoSubmissions, InsertVideoSubmission,
  userProgress, InsertUserProgress,
  achievements, InsertAchievement,
  userAchievements, InsertUserAchievement,
  notifications, InsertNotification
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
