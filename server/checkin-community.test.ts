import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("checkIn router", () => {
  it("status returns check-in status for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkIn.status();

    expect(result).toHaveProperty("checkedInToday");
    expect(result).toHaveProperty("currentStreak");
    expect(typeof result.checkedInToday).toBe("boolean");
    expect(typeof result.currentStreak).toBe("number");
  });

  it("stats returns check-in statistics for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkIn.stats();

    expect(result).toHaveProperty("totalCheckIns");
    expect(result).toHaveProperty("longestStreak");
    expect(result).toHaveProperty("totalXpFromCheckIns");
  });

  it("history returns check-in history for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkIn.history({ days: 30 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("community router", () => {
  it("list returns community posts for public access", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.community.list({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("list supports filtering by post type", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.community.list({ 
      limit: 10, 
      postType: "experience" 
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("comments returns comments for a post", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Post ID 1 may not exist, but the query should still work
    const result = await caller.community.comments({ postId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });
});
