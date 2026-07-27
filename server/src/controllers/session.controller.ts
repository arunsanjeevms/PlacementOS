import { Types, type FilterQuery } from "mongoose";
import dayjs from "dayjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/query.js";
import { computeStreaks, dateKey, todayKey } from "../utils/dates.js";
import { Session, type ISession } from "../models/Session.js";

export const createSession = asyncHandler(async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const startedAt = body.startedAt as Date;
  const endedAt = (body.endedAt as Date | undefined) ?? new Date();
  const key = (body.dateKey as string | undefined) ?? dateKey(startedAt);

  const session = await Session.create({
    ...body,
    endedAt,
    dateKey: key,
    user: req.user!.id,
  });
  return sendCreated(res, session, "Session logged");
});

export const listSessions = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const filter: FilterQuery<ISession> = { user: req.user!.id };
  if (q.category) filter.category = q.category as string;
  if (q.from || q.to) {
    filter.dateKey = {};
    if (q.from) (filter.dateKey as Record<string, string>).$gte = q.from as string;
    if (q.to) (filter.dateKey as Record<string, string>).$lte = q.to as string;
  }
  const { items, meta } = await paginate(Session, filter, {
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 100),
    sort: { startedAt: -1 },
  });
  return sendSuccess(res, items, "Sessions", 200, meta);
});

export const getSessionSummary = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user!.id);
  const today = todayKey();
  const last14 = dayjs().subtract(13, "day").format("YYYY-MM-DD");
  const last30 = dayjs().subtract(29, "day").format("YYYY-MM-DD");

  const [totals, todayAgg, perCategory, perDay, dayKeysDocs] = await Promise.all([
    Session.aggregate<{ minutes: number; count: number; longest: number; avg: number }>([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          minutes: { $sum: "$durationMinutes" },
          count: { $sum: 1 },
          longest: { $max: "$durationMinutes" },
          avg: { $avg: "$durationMinutes" },
        },
      },
    ]),
    Session.aggregate<{ minutes: number; count: number }>([
      { $match: { user: userId, dateKey: today } },
      { $group: { _id: null, minutes: { $sum: "$durationMinutes" }, count: { $sum: 1 } } },
    ]),
    Session.aggregate<{ _id: string; minutes: number; count: number }>([
      { $match: { user: userId, dateKey: { $gte: last30 } } },
      { $group: { _id: "$category", minutes: { $sum: "$durationMinutes" }, count: { $sum: 1 } } },
      { $sort: { minutes: -1 } },
    ]),
    Session.aggregate<{ _id: string; minutes: number }>([
      { $match: { user: userId, dateKey: { $gte: last14 } } },
      { $group: { _id: "$dateKey", minutes: { $sum: "$durationMinutes" } } },
    ]),
    Session.distinct("dateKey", { user: userId }),
  ]);

  const streaks = computeStreaks(dayKeysDocs as string[]);
  const total = totals[0] ?? { minutes: 0, count: 0, longest: 0, avg: 0 };

  // Build a dense last-14-days series for the mini chart.
  const perDayMap = new Map(perDay.map((d) => [d._id, d.minutes]));
  const series = Array.from({ length: 14 }).map((_, i) => {
    const key = dayjs().subtract(13 - i, "day").format("YYYY-MM-DD");
    return { date: key, minutes: perDayMap.get(key) ?? 0 };
  });

  return sendSuccess(res, {
    totalMinutes: total.minutes,
    totalSessions: total.count,
    longestSession: total.longest,
    avgSession: Math.round(total.avg || 0),
    todayMinutes: todayAgg[0]?.minutes ?? 0,
    todaySessions: todayAgg[0]?.count ?? 0,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    categories: perCategory.map((c) => ({ category: c._id, minutes: c.minutes, count: c.count })),
    last14Days: series,
  });
});

export const updateSession = asyncHandler(async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.id },
    { $set: req.body },
    { new: true }
  );
  if (!session) throw ApiError.notFound("Session not found");
  return sendSuccess(res, session, "Session updated");
});

export const deleteSession = asyncHandler(async (req, res) => {
  const deleted = await Session.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Session not found");
  return sendSuccess(res, { id: req.params.id }, "Session deleted");
});
