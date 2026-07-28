import { Types } from "mongoose";
import dayjs from "dayjs";
import { Session } from "../models/Session.js";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { Journal } from "../models/Journal.js";
import { Company } from "../models/Company.js";
import { Note } from "../models/Note.js";
import { Resource } from "../models/Resource.js";
import { computeStreaks, dateKey } from "../utils/dates.js";
import { getTrackerSummary } from "./topic.service.js";

function oid(id: string) {
  return new Types.ObjectId(id);
}

/** GitHub-style contribution data for the last `days` days. */
export async function getHeatmap(userId: string, days = 365) {
  const start = dayjs().subtract(days - 1, "day").format("YYYY-MM-DD");
  const startDate = dayjs(start).startOf("day").toDate();

  const [byMinutes, byTasks] = await Promise.all([
    Session.aggregate<{ _id: string; minutes: number; sessions: number }>([
      { $match: { user: oid(userId), dateKey: { $gte: start } } },
      { $group: { _id: "$dateKey", minutes: { $sum: "$durationMinutes" }, sessions: { $sum: 1 } } },
    ]),
    Task.aggregate<{ _id: string; tasks: number }>([
      { $match: { user: oid(userId), status: "done", completedAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, tasks: { $sum: 1 } } },
    ]),
  ]);

  const map = new Map<string, { date: string; minutes: number; sessions: number; tasks: number; count: number }>();
  for (const m of byMinutes) map.set(m._id, { date: m._id, minutes: m.minutes, sessions: m.sessions, tasks: 0, count: 0 });
  for (const t of byTasks) {
    const e = map.get(t._id) ?? { date: t._id, minutes: 0, sessions: 0, tasks: 0, count: 0 };
    e.tasks = t.tasks;
    map.set(t._id, e);
  }
  // Intensity level 0–4 from a blend of study minutes and completed tasks.
  const data = [...map.values()].map((e) => {
    const score = e.minutes + e.tasks * 20;
    const count = score === 0 ? 0 : score < 30 ? 1 : score < 90 ? 2 : score < 180 ? 3 : 4;
    return { ...e, count };
  });
  return data;
}

export async function getDayDetail(userId: string, day: string) {
  const start = dayjs(day).startOf("day").toDate();
  const end = dayjs(day).endOf("day").toDate();
  const [sessions, tasks, notes, journal] = await Promise.all([
    Session.find({ user: userId, dateKey: day }).sort({ startedAt: 1 }),
    Task.find({ user: userId, status: "done", completedAt: { $gte: start, $lte: end } }).select("title category"),
    Note.find({ user: userId, updatedAt: { $gte: start, $lte: end }, trashed: false }).select("title"),
    Journal.find({ user: userId, date: { $gte: start, $lte: end } }).select("company round outcome type"),
  ]);
  const minutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  return { date: day, minutes, sessions, tasks, notes, journal };
}

export async function getStatistics(userId: string, days = 30) {
  const start = dayjs().subtract(days - 1, "day").format("YYYY-MM-DD");
  const startDate = dayjs(start).startOf("day").toDate();
  const uid = oid(userId);

  const [perDay, perCategory, totals, perWeekday, tasksAgg, pomodoroCount] = await Promise.all([
    Session.aggregate<{ _id: string; minutes: number }>([
      { $match: { user: uid, dateKey: { $gte: start } } },
      { $group: { _id: "$dateKey", minutes: { $sum: "$durationMinutes" } } },
    ]),
    Session.aggregate<{ _id: string; minutes: number }>([
      { $match: { user: uid, dateKey: { $gte: start } } },
      { $group: { _id: "$category", minutes: { $sum: "$durationMinutes" } } },
      { $sort: { minutes: -1 } },
    ]),
    Session.aggregate<{ minutes: number; count: number; longest: number; avg: number }>([
      { $match: { user: uid } },
      { $group: { _id: null, minutes: { $sum: "$durationMinutes" }, count: { $sum: 1 }, longest: { $max: "$durationMinutes" }, avg: { $avg: "$durationMinutes" } } },
    ]),
    Session.aggregate<{ _id: number; minutes: number }>([
      { $match: { user: uid, dateKey: { $gte: start } } },
      { $group: { _id: { $dayOfWeek: "$startedAt" }, minutes: { $sum: "$durationMinutes" } } },
    ]),
    Task.aggregate<{ _id: string; count: number }>([
      { $match: { user: uid } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Session.countDocuments({ user: uid, mode: { $in: ["25/5", "45/10", "60/10", "90/20", "custom"] } }),
  ]);

  const perDayMap = new Map(perDay.map((d) => [d._id, d.minutes]));
  const studyByDay = Array.from({ length: days }).map((_, i) => {
    const key = dayjs().subtract(days - 1 - i, "day").format("YYYY-MM-DD");
    return { date: key, minutes: perDayMap.get(key) ?? 0 };
  });

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayMinutes = WEEKDAYS.map((label, i) => ({
    day: label,
    minutes: perWeekday.find((w) => w._id === i + 1)?.minutes ?? 0,
  }));
  const productiveDay = [...weekdayMinutes].sort((a, b) => b.minutes - a.minutes)[0]?.day ?? "—";

  const statusCounts = Object.fromEntries(tasksAgg.map((t) => [t._id, t.count]));
  const doneTasks = statusCounts.done ?? 0;
  const totalTasks = tasksAgg.reduce((s, t) => s + t.count, 0);
  const completedTasksInRange = await Task.countDocuments({ user: uid, status: "done", completedAt: { $gte: startDate } });

  const t = totals[0] ?? { minutes: 0, count: 0, longest: 0, avg: 0 };
  return {
    studyByDay,
    categoryDistribution: perCategory.map((c) => ({ category: c._id, minutes: c.minutes })),
    weekdayMinutes,
    productiveDay,
    totalMinutes: t.minutes,
    totalSessions: t.count,
    longestSession: t.longest,
    avgSession: Math.round(t.avg || 0),
    pomodoroCount,
    completedTasks: completedTasksInRange,
    completionRate: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
  };
}

export async function getReadiness(userId: string) {
  const [dsa, java, apt, core, projects, interviews, sessionAgg, companiesApplied, sessionDays] = await Promise.all([
    getTrackerSummary(userId, "dsa"),
    getTrackerSummary(userId, "java"),
    getTrackerSummary(userId, "aptitude"),
    getTrackerSummary(userId, "core"),
    Project.countDocuments({ user: userId, status: "completed" }),
    Journal.countDocuments({ user: userId }),
    Session.aggregate<{ minutes: number }>([{ $match: { user: oid(userId) } }, { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } }]),
    Company.countDocuments({ user: userId, applied: true }),
    Session.distinct("dateKey", { user: userId }),
  ]);

  const totalHours = (sessionAgg[0]?.minutes ?? 0) / 60;
  const streak = computeStreaks(sessionDays as string[]);

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const components = [
    { key: "DSA", weight: 25, value: dsa.progress / 100 },
    { key: "Java", weight: 12, value: java.progress / 100 },
    { key: "CS Fundamentals", weight: 13, value: core.progress / 100 },
    { key: "Aptitude", weight: 10, value: apt.progress / 100 },
    { key: "Projects", weight: 12, value: clamp(projects / 3) },
    { key: "Interviews", weight: 8, value: clamp(interviews / 5) },
    { key: "Study Hours", weight: 12, value: clamp(totalHours / 150) },
    { key: "Consistency", weight: 5, value: clamp(streak.current / 30) },
    { key: "Applications", weight: 3, value: clamp(companiesApplied / 10) },
  ];
  const score = Math.round(components.reduce((s, c) => s + c.value * c.weight, 0));
  return {
    score,
    components: components.map((c) => ({ label: c.key, weight: c.weight, score: Math.round(c.value * 100) })),
  };
}

export async function getDashboard(userId: string) {
  const uid = oid(userId);
  const today = dateKey(new Date());
  const startToday = dayjs().startOf("day").toDate();
  const endToday = dayjs().endOf("day").toDate();
  const weekStart = dayjs().startOf("week").format("YYYY-MM-DD");
  const monthStart = dayjs().startOf("month").format("YYYY-MM-DD");
  const in7 = dayjs().add(7, "day").endOf("day").toDate();

  const [sessionDays, totalAgg, todayAgg, weekAgg, monthAgg, todayTasks, todayDone, pending, upcoming, recentResources, recentProjects, recentNotes, readiness, companyAgg] =
    await Promise.all([
      Session.distinct("dateKey", { user: uid }),
      Session.aggregate<{ minutes: number }>([{ $match: { user: uid } }, { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } }]),
      Session.aggregate<{ minutes: number }>([{ $match: { user: uid, dateKey: today } }, { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } }]),
      Session.aggregate<{ minutes: number }>([{ $match: { user: uid, dateKey: { $gte: weekStart } } }, { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } }]),
      Session.aggregate<{ minutes: number }>([{ $match: { user: uid, dateKey: { $gte: monthStart } } }, { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } }]),
      Task.countDocuments({ user: uid, date: { $gte: startToday, $lte: endToday } }),
      Task.countDocuments({ user: uid, date: { $gte: startToday, $lte: endToday }, status: "done" }),
      Task.countDocuments({ user: uid, status: { $in: ["todo", "in_progress"] } }),
      Task.find({ user: uid, deadline: { $gte: startToday, $lte: in7 }, status: { $ne: "done" } }).sort({ deadline: 1 }).limit(5).select("title deadline priority category"),
      Resource.find({ user: uid }).sort({ createdAt: -1 }).limit(5).select("title url type"),
      Project.find({ user: uid }).sort({ updatedAt: -1 }).limit(4).select("title status"),
      Note.find({ user: uid, trashed: false }).sort({ updatedAt: -1 }).limit(5).select("title updatedAt"),
      getReadiness(userId),
      Company.aggregate<{ total: number; avg: number }>([{ $match: { user: uid } }, { $group: { _id: null, total: { $sum: 1 }, avg: { $avg: "$preparationProgress" } } }]),
    ]);

  const streak = computeStreaks(sessionDays as string[]);
  const totalMinutes = totalAgg[0]?.minutes ?? 0;

  return {
    streak: { current: streak.current, longest: streak.longest },
    study: {
      todayMinutes: todayAgg[0]?.minutes ?? 0,
      weekMinutes: weekAgg[0]?.minutes ?? 0,
      monthMinutes: monthAgg[0]?.minutes ?? 0,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
    },
    tasks: { todayTotal: todayTasks, todayDone, pending },
    upcoming,
    recentResources,
    recentProjects,
    recentNotes,
    readiness,
    company: { total: companyAgg[0]?.total ?? 0, avgProgress: Math.round(companyAgg[0]?.avg ?? 0) },
  };
}

const ACHIEVEMENT_DEFS = [
  { id: "streak_7", label: "7 Day Streak", desc: "Study 7 days in a row", metric: "streak", target: 7, icon: "🔥" },
  { id: "streak_30", label: "30 Day Streak", desc: "Study 30 days in a row", metric: "streak", target: 30, icon: "⚡" },
  { id: "hours_100", label: "100 Hours", desc: "Study for 100 hours", metric: "hours", target: 100, icon: "💯" },
  { id: "hours_500", label: "500 Hours", desc: "Study for 500 hours", metric: "hours", target: 500, icon: "🚀" },
  { id: "hours_1000", label: "1000 Hours", desc: "Study for 1000 hours", metric: "hours", target: 1000, icon: "🏆" },
  { id: "tasks_100", label: "100 Tasks", desc: "Complete 100 tasks", metric: "tasks", target: 100, icon: "✅" },
  { id: "tasks_500", label: "500 Tasks", desc: "Complete 500 tasks", metric: "tasks", target: 500, icon: "🎯" },
  { id: "leetcode_100", label: "100 Problems", desc: "Solve 100 DSA problems", metric: "dsa", target: 100, icon: "🧠" },
  { id: "project_done", label: "Project Shipped", desc: "Complete a project", metric: "projects", target: 1, icon: "📦" },
  { id: "interview_done", label: "First Interview", desc: "Log an interview", metric: "interviews", target: 1, icon: "🎤" },
] as const;

export async function getAchievements(userId: string) {
  const uid = oid(userId);
  const [sessionDays, totalAgg, tasksDone, dsaSummary, projectsDone, interviews] = await Promise.all([
    Session.distinct("dateKey", { user: uid }),
    Session.aggregate<{ minutes: number }>([{ $match: { user: uid } }, { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } }]),
    Task.countDocuments({ user: uid, status: "done" }),
    getTrackerSummary(userId, "dsa"),
    Project.countDocuments({ user: uid, status: "completed" }),
    Journal.countDocuments({ user: uid }),
  ]);

  const metrics: Record<string, number> = {
    streak: computeStreaks(sessionDays as string[]).longest,
    hours: Math.floor((totalAgg[0]?.minutes ?? 0) / 60),
    tasks: tasksDone,
    dsa: dsaSummary.solved ?? 0,
    projects: projectsDone,
    interviews,
  };

  return ACHIEVEMENT_DEFS.map((a) => {
    const value = metrics[a.metric] ?? 0;
    return {
      ...a,
      progress: Math.min(100, Math.round((value / a.target) * 100)),
      value,
      unlocked: value >= a.target,
    };
  });
}
