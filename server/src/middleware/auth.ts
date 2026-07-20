import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

export interface AuthedRequest extends Request {
  userId: string;
}

const userCache = new Map<string, { id: string; at: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function resolveUser(supabaseId: string, email: string, name?: string, avatarUrl?: string) {
  const cached = userCache.get(supabaseId);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.id;

  let user = await prisma.user.findUnique({ where: { supabaseId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        supabaseId,
        email,
        name: name || email.split("@")[0],
        avatarUrl,
        settings: { create: {} },
      },
    });
  }
  userCache.set(supabaseId, { id: user.id, at: Date.now() });
  return user.id;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (env.demoMode) {
      const userId = await resolveUser("demo-user", "demo@placementos.local", "Demo User");
      (req as AuthedRequest).userId = userId;
      return next();
    }

    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing bearer token" });
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, env.supabaseJwtSecret) as jwt.JwtPayload;
    const supabaseId = payload.sub as string;
    const email = (payload.email as string) || `${supabaseId}@placementos.local`;
    const meta = (payload.user_metadata as Record<string, string>) || {};
    const userId = await resolveUser(supabaseId, email, meta.full_name || meta.name, meta.avatar_url);
    (req as AuthedRequest).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireCronSecret(req: Request, res: Response, next: NextFunction) {
  const provided = req.headers["x-cron-secret"] || req.query.secret;
  if (!env.cronSecret || provided !== env.cronSecret) {
    return res.status(401).json({ error: "Invalid cron secret" });
  }
  next();
}

export const uid = (req: Request) => (req as AuthedRequest).userId;
