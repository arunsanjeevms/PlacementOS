import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH } from "../lib/http.js";
import { addDays, getActivityMap, getStatsSummary, toDateKey } from "../lib/stats.js";
import { evaluateAchievements } from "../lib/achievements.js";

const router = Router();

const todayOf = (req: { query: Record<string, unknown> }) =>
  typeof req.query.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.today)
    ? req.query.today
    : toDateKey(new Date());

router.get(
  "/summary",
  asyncH(async (req, res) => {
    const summary = await getStatsSummary(uid(req), todayOf(req as never));
    res.json(summary);
  })
);

router.get(
  "/heatmap",
  asyncH(async (req, res) => {
    const today = todayOf(req as never);
    const from = addDays(today, -370);
    const activity = await getActivityMap(uid(req), from, today);
    res.json([...activity.values()]);
  })
);

router.get(
  "/day/:dateKey",
  asyncH(async (req, res) => {
    const userId = uid(req);
    const { dateKey } = req.params;
    const [sessions, tasksDone, tasksPlanned, dayLog] = await Promise.all([
      prisma.studySession.findMany({ where: { userId, dateKey }, orderBy: { startedAt: "asc" }, include: { task: { select: { title: true } } } }),
      prisma.task.findMany({ where: { userId, status: "DONE", completedDate: dateKey } }),
      prisma.task.findMany({ where: { userId, scheduledFor: dateKey } }),
      prisma.dayLog.findFirst({ where: { userId, dateKey } }),
    ]);
    res.json({ dateKey, sessions, tasksDone, tasksPlanned, journal: dayLog?.journal ?? "" });
  })
);

router.put(
  "/day/:dateKey/journal",
  asyncH(async (req, res) => {
    const userId = uid(req);
    const { dateKey } = req.params;
    const journal = typeof req.body.journal === "string" ? req.body.journal : "";
    const log = await prisma.dayLog.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      create: { userId, dateKey, journal },
      update: { journal },
    });
    res.json(log);
  })
);

router.get(
  "/charts",
  asyncH(async (req, res) => {
    const userId = uid(req);
    const today = todayOf(req as never);
    const range = req.query.range === "year" ? 365 : req.query.range === "month" ? 30 : req.query.range === "week" ? 7 : 90;
    const from = addDays(today, -(range - 1));

    const sessions = await prisma.studySession.findMany({
      where: { userId, dateKey: { gte: from, lte: today } },
      select: { dateKey: true, durationMin: true, subject: true, isPomodoro: true, startedAt: true },
    });
    const tasks = await prisma.task.findMany({
      where: { userId, completedDate: { gte: from, lte: today } },
      select: { completedDate: true, category: true },
    });

    // Daily series
    const daily: { date: string; minutes: number; tasks: number }[] = [];
    const byDay = new Map<string, { minutes: number; tasks: number }>();
    for (const s of sessions) {
      const e = byDay.get(s.dateKey) ?? { minutes: 0, tasks: 0 };
      e.minutes += s.durationMin;
      byDay.set(s.dateKey, e);
    }
    for (const t of tasks) {
      if (!t.completedDate) continue;
      const e = byDay.get(t.completedDate) ?? { minutes: 0, tasks: 0 };
      e.tasks += 1;
      byDay.set(t.completedDate, e);
    }
    for (let i = 0; i < range; i++) {
      const key = addDays(from, i);
      const e = byDay.get(key);
      daily.push({ date: key, minutes: e?.minutes ?? 0, tasks: e?.tasks ?? 0 });
    }

    // Category distribution (by session subject + task category)
    const catMap = new Map<string, number>();
    for (const s of sessions) catMap.set(s.subject, (catMap.get(s.subject) ?? 0) + s.durationMin);
    const categories = [...catMap.entries()].map(([name, minutes]) => ({ name, minutes })).sort((a, b) => b.minutes - a.minutes);

    const taskCatMap = new Map<string, number>();
    for (const t of tasks) taskCatMap.set(t.category, (taskCatMap.get(t.category) ?? 0) + 1);
    const taskCategories = [...taskCatMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    // Weekday productivity
    const weekday = Array.from({ length: 7 }, (_, i) => ({ day: i, minutes: 0 }));
    for (const s of sessions) {
      const d = new Date(s.dateKey + "T00:00:00Z").getUTCDay();
      weekday[d].minutes += s.durationMin;
    }

    const pomodoroCount = sessions.filter((s) => s.isPomodoro).length;
    const longest = sessions.reduce((a, s) => Math.max(a, s.durationMin), 0);
    const totalMin = sessions.reduce((a, s) => a + s.durationMin, 0);

    res.json({
      daily,
      categories,
      taskCategories,
      weekday,
      pomodoroCount,
      longestSessionMin: longest,
      avgSessionMin: sessions.length ? Math.round(totalMin / sessions.length) : 0,
      totalSessions: sessions.length,
      totalMinutes: totalMin,
      totalTasksDone: tasks.length,
    });
  })
);

router.get(
  "/achievements",
  asyncH(async (req, res) => {
    const result = await evaluateAchievements(uid(req), todayOf(req as never));
    res.json(result);
  })
);

/** Overall placement readiness: weighted blend of tracker progress, prep, and consistency. */
router.get(
  "/readiness",
  asyncH(async (req, res) => {
    const userId = uid(req);
    const today = todayOf(req as never);
    const [topics, companies, projects, summary, mocks] = await Promise.all([
      prisma.topicProgress.findMany({ where: { userId } }),
      prisma.company.findMany({ where: { userId }, select: { preparation: true } }),
      prisma.project.findMany({ where: { userId }, select: { status: true } }),
      getStatsSummary(userId, today),
      prisma.mockInterview.count({ where: { userId } }),
    ]);

    const trackAvg = (track: string) => {
      const t = topics.filter((x) => x.track === track);
      return t.length ? t.reduce((a, x) => a + x.progress, 0) / t.length : 0;
    };
    const java = trackAvg("JAVA");
    const dsa = trackAvg("DSA");
    const apti = trackAvg("APTITUDE");
    const companyPrep = companies.length ? companies.reduce((a, c) => a + c.preparation, 0) / companies.length : 0;
    const projectScore = Math.min(100, projects.filter((p) => p.status === "COMPLETED").length * 34);
    const consistency = Math.min(100, summary.streaks.current * 10);
    const mockScore = Math.min(100, mocks * 25);

    const readiness = Math.round(java * 0.2 + dsa * 0.3 + apti * 0.15 + companyPrep * 0.1 + projectScore * 0.1 + consistency * 0.1 + mockScore * 0.05);
    res.json({
      readiness,
      breakdown: { java: Math.round(java), dsa: Math.round(dsa), aptitude: Math.round(apti), companyPrep: Math.round(companyPrep), projects: projectScore, consistency, mocks: mockScore },
    });
  })
);

export default router;
