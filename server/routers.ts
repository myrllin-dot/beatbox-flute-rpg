import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getCommentsByQuestId,
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
} from "./db";

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
});

export type AppRouter = typeof appRouter;
