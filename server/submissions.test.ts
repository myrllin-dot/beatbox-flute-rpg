import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getUserSubmissionsForQuest: vi.fn().mockResolvedValue([
    {
      id: 1,
      questId: "1-1",
      userId: 1,
      videoUrl: "https://example.com/video.mp4",
      videoKey: "submissions/1/1-1/abc123.mp4",
      title: "My Practice",
      description: "First attempt",
      status: "pending",
      score: null,
      feedback: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  createVideoSubmission: vi.fn().mockResolvedValue({ id: 2 }),
  deleteSubmission: vi.fn().mockResolvedValue({ success: true }),
  getAllSubmissions: vi.fn().mockResolvedValue([
    {
      id: 1,
      questId: "1-1",
      userId: 1,
      videoUrl: "https://example.com/video.mp4",
      videoKey: "submissions/1/1-1/abc123.mp4",
      title: "My Practice",
      description: "First attempt",
      status: "pending",
      score: null,
      feedback: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userName: "Test User",
      userEmail: "test@example.com",
    },
  ]),
  getPendingSubmissions: vi.fn().mockResolvedValue([]),
  reviewSubmission: vi.fn().mockResolvedValue({ success: true }),
  // Include comment mocks to prevent import errors
  getCommentsByQuestId: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue({ id: 1 }),
  deleteComment: vi.fn().mockResolvedValue({ success: true }),
  toggleCommentLike: vi.fn().mockResolvedValue({ liked: true }),
  updateComment: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/video.mp4", key: "test-key" }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(): TrpcContext {
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

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "admin-user-456",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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

describe("submissions.mySubmissions", () => {
  it("returns user submissions for a quest", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.submissions.mySubmissions({ questId: "1-1" });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 1,
      questId: "1-1",
      status: "pending",
    });
  });

  it("throws error when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.submissions.mySubmissions({ questId: "1-1" })
    ).rejects.toThrow();
  });
});

describe("submissions.delete", () => {
  it("deletes a submission when authenticated", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.submissions.delete({ submissionId: 1 });

    expect(result).toEqual({ success: true });
  });
});

describe("submissions.listAll (admin)", () => {
  it("returns all submissions for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.submissions.listAll({});

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 1,
      userName: "Test User",
    });
  });

  it("throws error when not admin", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.submissions.listAll({})
    ).rejects.toThrow();
  });
});

describe("submissions.review (admin)", () => {
  it("reviews a submission when admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.submissions.review({
      submissionId: 1,
      status: "approved",
      score: 85,
      feedback: "Great work!",
    });

    expect(result).toEqual({ success: true });
  });

  it("throws error when not admin", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.submissions.review({
        submissionId: 1,
        status: "approved",
      })
    ).rejects.toThrow();
  });
});
