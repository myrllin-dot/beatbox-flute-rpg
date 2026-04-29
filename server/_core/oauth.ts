import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { createSessionToken } from "./auth";
import { ENV } from "./env";
import * as crypto from "crypto";

// Simple password hashing using Node.js built-in crypto
function hashPassword(password: string): string {
  const salt = ENV.cookieSecret; // use JWT secret as salt
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

export function registerAuthRoutes(app: Express) {
  // ── Login ────────────────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    try {
      const user = await db.getUserByEmail(email.toLowerCase().trim());

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const hash = hashPassword(password);
      if (hash !== user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      const token = await createSessionToken(user.openId, user.name ?? email);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ ok: true, name: user.name });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ── Register ─────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    try {
      const existing = await db.getUserByEmail(email.toLowerCase().trim());
      if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }

      const openId = `user_${crypto.randomBytes(16).toString("hex")}`;
      const passwordHash = hashPassword(password);

      await db.upsertUser({
        openId,
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        passwordHash,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      const token = await createSessionToken(openId, name?.trim() ?? email);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ ok: true, name: name?.trim() ?? email });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // ── Logout ───────────────────────────────────────────────────────────────
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ ok: true });
  });

  // ── Me (check current session) ───────────────────────────────────────────
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const { verifySessionToken } = await import("./auth");
    const { parse } = await import("cookie");
    const cookies = parse(req.headers.cookie ?? "");
    const token = cookies[COOKIE_NAME];
    const session = await verifySessionToken(token);

    if (!session) {
      res.json({ user: null });
      return;
    }

    const user = await db.getUserByOpenId(session.userId);
    if (!user) {
      res.json({ user: null });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
}
