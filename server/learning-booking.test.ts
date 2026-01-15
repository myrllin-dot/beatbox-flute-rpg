import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
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
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("learningPath", () => {
  it("myProgress returns user progress data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.learningPath.myProgress();

    expect(Array.isArray(result)).toBe(true);
  });


});

describe("booking", () => {
  it("availableSlots returns an array", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.availableSlots();

    expect(Array.isArray(result)).toBe(true);
  });

  it("myAppointments returns an array", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.myAppointments();

    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can create booking slots", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);

    const result = await caller.booking.createSlot({
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      duration: 60,
      price: 5000,
    });

    expect(result).toHaveProperty("id");
  });

  it("admin can view instructor appointments", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.instructorAppointments();

    expect(Array.isArray(result)).toBe(true);
  });
});
