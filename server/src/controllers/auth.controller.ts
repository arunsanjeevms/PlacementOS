import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { clearAuthCookies, cookieNames, setAuthCookies } from "../utils/tokens.js";
import * as authService from "../services/auth.service.js";
import { User } from "../models/User.js";

function sessionContext(req: Request) {
  return { userAgent: req.get("user-agent") ?? undefined, ip: req.ip };
}

export const register = asyncHandler(async (req, res) => {
  const session = await authService.registerUser(req.body, sessionContext(req));
  setAuthCookies(res, session.accessToken, session.refreshToken, session.rememberMe);
  return sendCreated(res, { user: session.user.toJSON(), accessToken: session.accessToken }, "Account created");
});

export const login = asyncHandler(async (req, res) => {
  const session = await authService.loginUser(req.body, sessionContext(req));
  setAuthCookies(res, session.accessToken, session.refreshToken, session.rememberMe);
  return sendSuccess(res, { user: session.user.toJSON(), accessToken: session.accessToken }, "Logged in");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[cookieNames.refresh];
  const session = await authService.refreshSession(token ?? "", sessionContext(req));
  setAuthCookies(res, session.accessToken, session.refreshToken, session.rememberMe);
  return sendSuccess(res, { user: session.user.toJSON(), accessToken: session.accessToken }, "Session refreshed");
});

export const logout = asyncHandler(async (req, res) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[cookieNames.refresh];
  if (req.user) await authService.logout(req.user.id, token);
  clearAuthCookies(res);
  return sendSuccess(res, null, "Logged out");
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user!.id);
  clearAuthCookies(res);
  return sendSuccess(res, null, "Logged out of all sessions");
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");
  return sendSuccess(res, { user: user.toJSON() });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return sendSuccess(res, null, "If an account exists, a reset link has been sent");
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  return sendSuccess(res, null, "Password reset — please sign in");
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  return sendSuccess(res, null, "Email verified");
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.user!.id);
  return sendSuccess(res, null, "Verification email sent");
});
