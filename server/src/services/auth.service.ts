import dayjs from "dayjs";
import { User, type IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createHashedToken,
  hashToken,
  newTokenId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { seedUserDefaults } from "./seed.service.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email.service.js";
import { env } from "../config/env.js";

interface SessionContext {
  userAgent?: string;
  ip?: string;
  rememberMe?: boolean;
}

export interface IssuedSession {
  user: IUser;
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
}

const clientUrl = env.clientUrls[0] ?? "http://localhost:5173";

/** Issues an access+refresh pair and records the refresh session on the user. */
async function issueSession(user: IUser, ctx: SessionContext): Promise<IssuedSession> {
  const rememberMe = ctx.rememberMe ?? true;
  const tokenId = newTokenId();
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, tokenId });

  const expiresAt = dayjs().add(rememberMe ? 30 : 1, "day").toDate();
  // Keep only the 10 most recent sessions to bound the array.
  const sessions = (user.refreshTokens ?? []).slice(-9);
  sessions.push({ tokenId, expiresAt, userAgent: ctx.userAgent, ip: ctx.ip, createdAt: new Date() });
  user.refreshTokens = sessions;
  user.lastLoginAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken, rememberMe };
}

export async function registerUser(
  input: { name: string; email: string; password: string },
  ctx: SessionContext
): Promise<IssuedSession> {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const { token, hashed } = createHashedToken();
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    emailVerificationToken: hashed,
    emailVerificationExpires: dayjs().add(24, "hour").toDate(),
  });

  // Seed default trackers/settings so the app is immediately useful.
  await seedUserDefaults(user.id);

  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, user.name, verifyUrl);

  return issueSession(user, ctx);
}

export async function loginUser(
  input: { email: string; password: string; rememberMe?: boolean },
  ctx: SessionContext
): Promise<IssuedSession> {
  const user = await User.findOne({ email: input.email }).select("+password +refreshTokens");
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  const ok = await user.comparePassword(input.password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  return issueSession(user, { ...ctx, rememberMe: input.rememberMe });
}

/** Verifies the refresh token, rotates its tokenId, and returns a fresh pair. */
export async function refreshSession(refreshToken: string, ctx: SessionContext): Promise<IssuedSession> {
  if (!refreshToken) throw ApiError.unauthorized("No refresh token");
  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user) throw ApiError.unauthorized("Session no longer valid");

  const sessions = user.refreshTokens ?? [];
  const idx = sessions.findIndex((s) => s.tokenId === payload.tokenId);
  if (idx === -1) throw ApiError.unauthorized("Session revoked");
  if (dayjs(sessions[idx].expiresAt).isBefore(dayjs())) {
    sessions.splice(idx, 1);
    user.refreshTokens = sessions;
    await user.save();
    throw ApiError.unauthorized("Session expired");
  }

  // Rotate: drop old session id, issueSession pushes a new one.
  const preserved = ctx.userAgent ?? sessions[idx].userAgent;
  const rememberMe = dayjs(sessions[idx].expiresAt).diff(sessions[idx].createdAt, "day") > 1;
  sessions.splice(idx, 1);
  user.refreshTokens = sessions;
  return issueSession(user, { userAgent: preserved, ip: ctx.ip, rememberMe });
}

export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await User.updateOne({ _id: userId }, { $pull: { refreshTokens: { tokenId: payload.tokenId } } });
  } catch {
    /* token already invalid — nothing to revoke */
  }
}

export async function logoutAll(userId: string): Promise<void> {
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email });
  // Always resolve without leaking whether the email exists.
  if (!user) return;
  const { token, hashed } = createHashedToken();
  user.passwordResetToken = hashed;
  user.passwordResetExpires = dayjs().add(1, "hour").toDate();
  await user.save();
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, user.name, resetUrl);
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const hashed = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");
  if (!user) throw ApiError.badRequest("Invalid or expired reset token");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // force re-login everywhere
  await user.save();
}

export async function verifyEmail(token: string): Promise<void> {
  const hashed = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) throw ApiError.badRequest("Invalid or expired verification token");
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
}

export async function resendVerification(userId: string): Promise<void> {
  const user = await User.findById(userId).select("+emailVerificationToken +emailVerificationExpires");
  if (!user || user.isEmailVerified) return;
  const { token, hashed } = createHashedToken();
  user.emailVerificationToken = hashed;
  user.emailVerificationExpires = dayjs().add(24, "hour").toDate();
  await user.save();
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, user.name, verifyUrl);
}
