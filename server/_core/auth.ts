import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { ForbiddenError } from "@shared/_core/errors";

// ── JWT helpers ──────────────────────────────────────────────────────────────

function getSecretKey() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createSessionToken(userId: string, name: string): Promise<string> {
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ userId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ userId: string; name: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    const { userId, name } = payload as Record<string, unknown>;
    if (typeof userId !== "string" || typeof name !== "string") return null;
    return { userId, name };
  } catch {
    return null;
  }
}

// ── Request authentication ───────────────────────────────────────────────────

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) return new Map();
  return new Map(Object.entries(parseCookieHeader(cookieHeader)));
}

export async function authenticateRequest(req: Request): Promise<User> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.get(COOKIE_NAME);
  const session = await verifySessionToken(token);

  if (!session) throw ForbiddenError("Invalid session");

  const user = await db.getUserByOpenId(session.userId);
  if (!user) throw ForbiddenError("User not found");

  return user;
}
