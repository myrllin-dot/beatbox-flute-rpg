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
});

export type AppRouter = typeof appRouter;
