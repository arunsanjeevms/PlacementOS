import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import type { Response } from "express";
import { env } from "../config/env.js";

export type UserRole = "user" | "admin";

export interface AccessTokenPayload {
  sub: string; // user id
  role: UserRole;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string; // rotates per issue, lets us revoke a single session
}

const ACCESS_COOKIE = "pos_access";
const REFRESH_COOKIE = "pos_refresh";

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  } as SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
}

/** Random opaque id embedded in refresh tokens so a specific session can be revoked. */
export function newTokenId(): string {
  return crypto.randomUUID();
}

/** Generate a URL-safe random token + its sha256 hash (store the hash, email the raw token). */
export function createHashedToken(): { token: string; hashed: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const isProd = env.isProd;

/** Base cookie options shared by access + refresh cookies. */
function baseCookie(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: isProd, // requires HTTPS in prod
    sameSite: isProd ? ("none" as const) : ("lax" as const), // cross-site (Vercel↔Render) in prod
    domain: env.cookieDomain,
    path: "/",
    maxAge: maxAgeMs,
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string, rememberMe = true): void {
  const accessMax = 15 * 60 * 1000; // 15m
  const refreshMax = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30d or 1d
  res.cookie(ACCESS_COOKIE, accessToken, baseCookie(accessMax));
  res.cookie(REFRESH_COOKIE, refreshToken, baseCookie(refreshMax));
}

export function clearAuthCookies(res: Response): void {
  const opts = { httpOnly: true, secure: isProd, sameSite: isProd ? ("none" as const) : ("lax" as const), domain: env.cookieDomain, path: "/" };
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
}

export const cookieNames = { access: ACCESS_COOKIE, refresh: REFRESH_COOKIE } as const;
