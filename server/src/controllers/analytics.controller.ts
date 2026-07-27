import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as analytics from "../services/analytics.service.js";

export const heatmap = asyncHandler(async (req, res) => {
  const days = Math.min(366, Math.max(30, Number(req.query.days ?? 365)));
  const data = await analytics.getHeatmap(req.user!.id, days);
  return sendSuccess(res, data, "Heatmap");
});

export const dayDetail = asyncHandler(async (req, res) => {
  const day = String(req.query.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return sendSuccess(res, null, "Invalid date");
  const data = await analytics.getDayDetail(req.user!.id, day);
  return sendSuccess(res, data, "Day detail");
});

export const statistics = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(7, Number(req.query.days ?? 30)));
  const data = await analytics.getStatistics(req.user!.id, days);
  return sendSuccess(res, data, "Statistics");
});

export const dashboard = asyncHandler(async (req, res) => {
  const data = await analytics.getDashboard(req.user!.id);
  return sendSuccess(res, data, "Dashboard");
});

export const readiness = asyncHandler(async (req, res) => {
  const data = await analytics.getReadiness(req.user!.id);
  return sendSuccess(res, data, "Readiness");
});

export const achievements = asyncHandler(async (req, res) => {
  const data = await analytics.getAchievements(req.user!.id);
  return sendSuccess(res, data, "Achievements");
});
