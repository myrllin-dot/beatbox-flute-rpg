import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-reminders",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
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

function createAdminContext(): { ctx: TrpcContext } {
  return createAuthContext("admin");
}

describe("reminder", () => {
  it("should have get procedure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw
    const result = await caller.reminder.get();
    expect(result).toBeDefined();
  });

  it("should have update procedure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw
    const result = await caller.reminder.update({
      enabled: true,
      reminderTime: "18:00",
    });
    expect(result).toBeDefined();
  });
});

describe("challenges", () => {
  it("should have active procedure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw and return an array
    const result = await caller.challenges.active();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should have myChallenges procedure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw and return an array
    const result = await caller.challenges.myChallenges();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin should be able to create challenges", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    // Should not throw
    const result = await caller.challenges.create({
      titleZh: "測試挑戰",
      titleEn: "Test Challenge",
      descriptionZh: "這是一個測試挑戰",
      descriptionEn: "This is a test challenge",
      challengeType: "quest_count",
      targetValue: 3,
      xpReward: 100,
      badgeReward: "test_badge",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    expect(result).toBeDefined();
  });
});
