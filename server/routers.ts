import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getCommentsByQuestId,
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
  createVideoSubmission,
  getUserSubmissionsForQuest,
  getPendingSubmissions,
  getAllSubmissions,
  reviewSubmission,
  deleteSubmission,
  // Progress & Leaderboard
  getUserProgress,
  updateUserProgress,
  getAllUserProgress,
  getLeaderboard,
  getUserRank,
  // Achievements
  getAllAchievements,
  getUserAchievements,
  awardAchievement,
  createAchievement,
  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  // Check-in
  hasCheckedInToday,
  getUserStreak,
  performCheckIn,
  getCheckInHistory,
  getCheckInStats,
  // Community
  createCommunityPost,
  getCommunityPosts,
  getPostById,
  togglePostLike,
  hasUserLikedPost,
  addPostComment,
  getPostComments,
  deleteCommunityPost,
  // Practice Reminders
  getPracticeReminder,
  upsertPracticeReminder,
  // Challenges
  getActiveChallenges,
  getAllChallenges,
  getChallengeById,
  createChallenge,
  joinChallenge,
  getChallengeParticipation,
  getUserChallenges,
  updateChallengeProgress,
  getChallengeLeaderboard,
  deleteChallenge,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Comments API for quest discussions
  comments: router({
    // Get all comments for a quest
    list: publicProcedure
      .input(z.object({ questId: z.string() }))
      .query(async ({ input, ctx }) => {
        const comments = await getCommentsByQuestId(input.questId, ctx.user?.id);
        return comments;
      }),

    // Create a new comment (requires auth)
    create: protectedProcedure
      .input(z.object({
        questId: z.string(),
        content: z.string().min(1).max(2000),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createComment({
          questId: input.questId,
          userId: ctx.user.id,
          content: input.content,
          parentId: input.parentId,
        });
        return result;
      }),

    // Update a comment (only owner)
    update: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        content: z.string().min(1).max(2000),
      }))
      .mutation(async ({ input, ctx }) => {
        return await updateComment(input.commentId, ctx.user.id, input.content);
      }),

    // Delete a comment (owner or admin)
    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const isAdmin = ctx.user.role === 'admin';
        return await deleteComment(input.commentId, ctx.user.id, isAdmin);
      }),

    // Toggle like on a comment
    toggleLike: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await toggleCommentLike(input.commentId, ctx.user.id);
      }),
  }),

  // Video Submissions API
  submissions: router({
    // Get user's submissions for a quest
    mySubmissions: protectedProcedure
      .input(z.object({ questId: z.string() }))
      .query(async ({ input, ctx }) => {
        return await getUserSubmissionsForQuest(input.questId, ctx.user.id);
      }),

    // Upload a new video submission
    upload: protectedProcedure
      .input(z.object({
        questId: z.string(),
        title: z.string().max(256).optional(),
        description: z.string().max(2000).optional(),
        videoBase64: z.string(),
        mimeType: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.videoBase64, 'base64');
        const fileKey = `submissions/${ctx.user.id}/${input.questId}/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Create database record
        const result = await createVideoSubmission({
          questId: input.questId,
          userId: ctx.user.id,
          videoUrl: url,
          videoKey: fileKey,
          title: input.title,
          description: input.description,
        });

        return result;
      }),

    // Delete a submission (owner or admin)
    delete: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const isAdmin = ctx.user.role === 'admin';
        return await deleteSubmission(input.submissionId, ctx.user.id, isAdmin);
      }),

    // Admin: Get all submissions
    listAll: adminProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return await getAllSubmissions(input.status);
      }),

    // Admin: Get pending submissions
    pending: adminProcedure
      .query(async () => {
        return await getPendingSubmissions();
      }),

    // Admin: Review a submission
    review: adminProcedure
      .input(z.object({
        submissionId: z.number(),
        status: z.enum(["approved", "rejected", "needs_revision"]),
        score: z.number().min(0).max(100).optional(),
        feedback: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await reviewSubmission({
          submissionId: input.submissionId,
          reviewerId: ctx.user.id,
          status: input.status,
          score: input.score,
          feedback: input.feedback,
        });
      }),
  }),

  // User Progress API
  progress: router({
    // Get user's progress for a specific quest
    get: protectedProcedure
      .input(z.object({ questId: z.string() }))
      .query(async ({ input, ctx }) => {
        return await getUserProgress(ctx.user.id, input.questId);
      }),

    // Get all progress for current user
    myProgress: protectedProcedure
      .query(async ({ ctx }) => {
        return await getAllUserProgress(ctx.user.id);
      }),

    // Update progress for a quest
    update: protectedProcedure
      .input(z.object({
        questId: z.string(),
        progress: z.number().min(0).max(100),
        completed: z.boolean().optional(),
        xpEarned: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await updateUserProgress({
          userId: ctx.user.id,
          questId: input.questId,
          progress: input.progress,
          completed: input.completed,
          xpEarned: input.xpEarned,
        });

        // If quest is completed, create notification and check for achievements
        if (input.completed) {
          await createNotification({
            userId: ctx.user.id,
            type: 'quest_complete',
            titleZh: '任務完成！',
            titleEn: 'Quest Completed!',
            messageZh: `恭喜你完成了任務 ${input.questId}，獲得 ${input.xpEarned || 0} XP！`,
            messageEn: `Congratulations! You completed quest ${input.questId} and earned ${input.xpEarned || 0} XP!`,
            relatedId: input.questId,
          });

          // Check for first quest achievement
          const allProgress = await getAllUserProgress(ctx.user.id);
          const completedCount = allProgress.filter(p => p.completed === 1).length;
          
          if (completedCount === 1) {
            try {
              const achResult = await awardAchievement(ctx.user.id, 'first_quest');
              if (!achResult.alreadyEarned) {
                await createNotification({
                  userId: ctx.user.id,
                  type: 'achievement',
                  titleZh: '獲得成就！',
                  titleEn: 'Achievement Unlocked!',
                  messageZh: `你獲得了「${achResult.achievement.nameZh}」成就！`,
                  messageEn: `You earned the "${achResult.achievement.nameEn}" achievement!`,
                  relatedId: achResult.achievement.code,
                });
              }
            } catch (e) {
              // Achievement might not exist yet, ignore
            }
          }
        }

        return result;
      }),

    // Get user's rank
    myRank: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserRank(ctx.user.id);
      }),
  }),

  // Leaderboard API
  leaderboard: router({
    // Get top users
    top: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional() }))
      .query(async ({ input }) => {
        return await getLeaderboard(input.limit || 20);
      }),
  }),

  // Achievements API
  achievements: router({
    // Get all available achievements
    list: publicProcedure
      .query(async () => {
        return await getAllAchievements();
      }),

    // Get user's earned achievements
    myAchievements: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserAchievements(ctx.user.id);
      }),

    // Admin: Create a new achievement
    create: adminProcedure
      .input(z.object({
        code: z.string().min(1).max(64),
        nameZh: z.string().min(1).max(128),
        nameEn: z.string().min(1).max(128),
        descriptionZh: z.string().optional(),
        descriptionEn: z.string().optional(),
        iconUrl: z.string().optional(),
        xpReward: z.number().min(0).optional(),
        category: z.enum(['quest', 'skill', 'social', 'special']).optional(),
      }))
      .mutation(async ({ input }) => {
        return await createAchievement({
          code: input.code,
          nameZh: input.nameZh,
          nameEn: input.nameEn,
          descriptionZh: input.descriptionZh ?? null,
          descriptionEn: input.descriptionEn ?? null,
          iconUrl: input.iconUrl ?? null,
          xpReward: input.xpReward ?? 0,
          category: input.category ?? 'quest',
        });
      }),
  }),

  // Notifications API
  notifications: router({
    // Get user's notifications
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }))
      .query(async ({ input, ctx }) => {
        return await getUserNotifications(ctx.user.id, input.unreadOnly);
      }),

    // Get unread count
    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUnreadNotificationCount(ctx.user.id);
      }),

    // Mark notification as read
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await markNotificationRead(input.notificationId, ctx.user.id);
      }),

    // Mark all as read
    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return await markAllNotificationsRead(ctx.user.id);
      }),
  }),

  // Daily Check-in API
  checkIn: router({
    // Check if user has checked in today
    status: protectedProcedure
      .query(async ({ ctx }) => {
        const checkedIn = await hasCheckedInToday(ctx.user.id);
        const streak = await getUserStreak(ctx.user.id);
        return { checkedInToday: checkedIn, currentStreak: streak };
      }),

    // Perform daily check-in
    perform: protectedProcedure
      .mutation(async ({ ctx }) => {
        const result = await performCheckIn(ctx.user.id);
        
        // Create notification for successful check-in
        if (result.success) {
          await createNotification({
            userId: ctx.user.id,
            type: 'achievement',
            titleZh: '簽到成功！',
            titleEn: 'Check-in Successful!',
            messageZh: `連續簽到 ${result.streakCount} 天，獲得 ${result.xpEarned} XP！`,
            messageEn: `${result.streakCount} day streak! Earned ${result.xpEarned} XP!`,
            relatedId: 'checkin',
          });

          // Check for streak achievements
          if (result.streakCount === 7) {
            try {
              const achResult = await awardAchievement(ctx.user.id, 'week_streak');
              if (!achResult.alreadyEarned) {
                await createNotification({
                  userId: ctx.user.id,
                  type: 'achievement',
                  titleZh: '獲得成就！',
                  titleEn: 'Achievement Unlocked!',
                  messageZh: `你獲得了「${achResult.achievement.nameZh}」成就！`,
                  messageEn: `You earned the "${achResult.achievement.nameEn}" achievement!`,
                  relatedId: achResult.achievement.code,
                });
              }
            } catch (e) {
              // Achievement might not exist yet
            }
          }
        }

        return result;
      }),

    // Get check-in history
    history: protectedProcedure
      .input(z.object({ days: z.number().min(7).max(365).optional() }))
      .query(async ({ input, ctx }) => {
        return await getCheckInHistory(ctx.user.id, input.days || 30);
      }),

    // Get check-in stats
    stats: protectedProcedure
      .query(async ({ ctx }) => {
        return await getCheckInStats(ctx.user.id);
      }),
  }),

  // Community Posts API
  community: router({
    // Get community posts
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
        postType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await getCommunityPosts({
          limit: input.limit,
          offset: input.offset,
          postType: input.postType,
        });
      }),

    // Get single post
    get: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await getPostById(input.postId);
      }),

    // Create a new post
    create: protectedProcedure
      .input(z.object({
        content: z.string().min(1).max(2000),
        imageUrl: z.string().optional(),
        questId: z.string().optional(),
        postType: z.enum(['experience', 'question', 'achievement', 'encouragement']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await createCommunityPost({
          userId: ctx.user.id,
          content: input.content,
          imageUrl: input.imageUrl,
          questId: input.questId,
          postType: input.postType,
        });
      }),

    // Toggle like on a post
    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await togglePostLike(input.postId, ctx.user.id);
      }),

    // Check if user liked a post
    hasLiked: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await hasUserLikedPost(input.postId, ctx.user.id);
      }),

    // Get comments for a post
    comments: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await getPostComments(input.postId);
      }),

    // Add comment to a post
    addComment: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        return await addPostComment({
          postId: input.postId,
          userId: ctx.user.id,
          content: input.content,
        });
      }),

    // Delete a post
    delete: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const isAdmin = ctx.user.role === 'admin';
        return await deleteCommunityPost(input.postId, ctx.user.id, isAdmin);
      }),
  }),

  // Practice Reminders API
  reminder: router({
    // Get user's reminder settings
    get: protectedProcedure
      .query(async ({ ctx }) => {
        const reminder = await getPracticeReminder(ctx.user.id);
        if (!reminder) {
          return {
            enabled: true,
            reminderTime: '19:00',
            daysOfWeek: '0,1,2,3,4,5,6',
            timezoneOffset: 480,
          };
        }
        return {
          enabled: reminder.enabled === 1,
          reminderTime: reminder.reminderTime,
          daysOfWeek: reminder.daysOfWeek,
          timezoneOffset: reminder.timezoneOffset,
        };
      }),

    // Update reminder settings
    update: protectedProcedure
      .input(z.object({
        enabled: z.boolean().optional(),
        reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        daysOfWeek: z.string().optional(),
        timezoneOffset: z.number().min(-720).max(840).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await upsertPracticeReminder({
          userId: ctx.user.id,
          enabled: input.enabled,
          reminderTime: input.reminderTime,
          daysOfWeek: input.daysOfWeek,
          timezoneOffset: input.timezoneOffset,
        });
      }),
  }),

  // Challenges API
  challenges: router({
    // Get active challenges
    active: publicProcedure
      .query(async () => {
        return await getActiveChallenges();
      }),

    // Get all challenges (admin)
    all: adminProcedure
      .query(async () => {
        return await getAllChallenges();
      }),

    // Get single challenge
    get: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return await getChallengeById(input.challengeId);
      }),

    // Create a challenge (admin only)
    create: adminProcedure
      .input(z.object({
        titleZh: z.string().min(1).max(256),
        titleEn: z.string().min(1).max(256),
        descriptionZh: z.string().min(1),
        descriptionEn: z.string().min(1),
        challengeType: z.enum(['quest_count', 'streak', 'xp_gain', 'video_submit']),
        targetValue: z.number().min(1),
        xpReward: z.number().min(0).optional(),
        badgeId: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await createChallenge({
          titleZh: input.titleZh,
          titleEn: input.titleEn,
          descriptionZh: input.descriptionZh,
          descriptionEn: input.descriptionEn,
          challengeType: input.challengeType,
          targetValue: input.targetValue,
          xpReward: input.xpReward,
          badgeId: input.badgeId,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        });
      }),

    // Join a challenge
    join: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await joinChallenge(input.challengeId, ctx.user.id);
      }),

    // Get user's participation in a challenge
    participation: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await getChallengeParticipation(input.challengeId, ctx.user.id);
      }),

    // Get all challenges user has joined
    myChallenges: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserChallenges(ctx.user.id);
      }),

    // Get challenge leaderboard
    leaderboard: publicProcedure
      .input(z.object({ 
        challengeId: z.number(),
        limit: z.number().min(1).max(50).optional(),
      }))
      .query(async ({ input }) => {
        return await getChallengeLeaderboard(input.challengeId, input.limit || 10);
      }),

    // Delete a challenge (admin only)
    delete: adminProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteChallenge(input.challengeId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
