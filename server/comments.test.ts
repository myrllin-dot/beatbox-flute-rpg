import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getCommentsByQuestId: vi.fn().mockResolvedValue([
    {
      id: 1,
      questId: "1-1",
      userId: 1,
      content: "This is a test comment",
      parentId: null,
      likes: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      userName: "Test User",
      userEmail: "test@example.com",
      isLikedByUser: false,
    },
  ]),
  createComment: vi.fn().mockResolvedValue({ id: 2 }),
  deleteComment: vi.fn().mockResolvedValue({ success: true }),
  toggleCommentLike: vi.fn().mockResolvedValue({ liked: true }),
  updateComment: vi.fn().mockResolvedValue({ success: true }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("comments.list", () => {
  it("returns comments for a quest", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.list({ questId: "1-1" });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 1,
      questId: "1-1",
      content: "This is a test comment",
      userName: "Test User",
    });
  });
});

describe("comments.create", () => {
  it("creates a new comment when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.create({
      questId: "1-1",
      content: "New comment content",
    });

    expect(result).toEqual({ id: 2 });
  });

  it("throws error when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.comments.create({
        questId: "1-1",
        content: "New comment content",
      })
    ).rejects.toThrow();
  });
});

describe("comments.delete", () => {
  it("deletes a comment when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.delete({ commentId: 1 });

    expect(result).toEqual({ success: true });
  });
});

describe("comments.toggleLike", () => {
  it("toggles like on a comment when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.toggleLike({ commentId: 1 });

    expect(result).toEqual({ liked: true });
  });
});

describe("comments.update", () => {
  it("updates a comment when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.update({
      commentId: 1,
      content: "Updated content",
    });

    expect(result).toEqual({ success: true });
  });
});
