import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, comments, commentLikes, InsertComment } from "../drizzle/schema";
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
