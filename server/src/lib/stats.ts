import { prisma } from "./prisma.js";

export const dayMs = 24 * 60 * 60 * 1000;

export function toDateKey(d: Date, tzOffsetMin = 0): string {
  const local = new Date(d.getTime() - tzOffsetMin * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(dateKey + "T00:00:00Z");
  return new Date(d.getTime() + days * dayMs).toISOString().slice(0, 10);
}

export interface DayActivity {
  dateKey: string;
  minutes: number;
  tasksDone: number;
  sessions: number;
}

/** Aggregate per-day activity from study sessions + completed tasks. */
export async function getActivityMap(userId: string, from?: string, to?: string) {
  const [sessions, tasks] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, ...(from && { dateKey: { gte: from, ...(to && { lte: to }) } }) },
      select: { dateKey: true, durationMin: true },
    }),
    prisma.task.findMany({
      where: {
        userId,
        status: "DONE",
        completedDate: { not: null, ...(from && { gte: from }), ...(to && { lte: to }) },
      },
      select: { completedDate: true },
    }),
  ]);

  const map = new Map<string, DayActivity>();
  const get = (key: string) => {
    let e = map.get(key);
    if (!e) {
      e = { dateKey: key, minutes: 0, tasksDone: 0, sessions: 0 };
      map.set(key, e);
    }
    return e;
  };
  for (const s of sessions) {
    const e = get(s.dateKey);
    e.minutes += s.durationMin;
    e.sessions += 1;
  }
  for (const t of tasks) {
    if (t.completedDate) get(t.completedDate).tasksDone += 1;
  }
  return map;
}

export function computeStreaks(activity: Map<string, DayActivity>, todayKey: string) {
  const active = new Set(
    [...activity.values()].filter((d) => d.minutes > 0 || d.tasksDone > 0).map((d) => d.dateKey)
  );

  let current = 0;
  // Today counts if active, but an inactive today doesn't break the streak yet.
  let cursor = active.has(todayKey) ? todayKey : addDays(todayKey, -1);
  while (active.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  const sorted = [...active].sort();
  let run = 0;
  let prev: string | null = null;
  for (const key of sorted) {
    run = prev !== null && addDays(prev, 1) === key ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = key;
  }
  return { current, longest };
}

export async function getStatsSummary(userId: string, todayKey: string) {
  const activity = await getActivityMap(userId);
  const streaks = computeStreaks(activity, todayKey);

  const totalMinutes = [...activity.values()].reduce((a, d) => a + d.minutes, 0);
  const totalTasksDone = [...activity.values()].reduce((a, d) => a + d.tasksDone, 0);
  const totalSessions = [...activity.values()].reduce((a, d) => a + d.sessions, 0);

  const weekStart = addDays(todayKey, -6);
  const monthStart = addDays(todayKey, -29);
  let weekMinutes = 0;
  let monthMinutes = 0;
  let weekTasks = 0;
  let monthTasks = 0;
  for (const d of activity.values()) {
    if (d.dateKey >= weekStart && d.dateKey <= todayKey) {
      weekMinutes += d.minutes;
      weekTasks += d.tasksDone;
    }
    if (d.dateKey >= monthStart && d.dateKey <= todayKey) {
      monthMinutes += d.minutes;
      monthTasks += d.tasksDone;
    }
  }
  const today = activity.get(todayKey);

  return {
    streaks,
    todayMinutes: today?.minutes ?? 0,
    todayTasksDone: today?.tasksDone ?? 0,
    weekMinutes,
    monthMinutes,
    weekTasks,
    monthTasks,
    totalMinutes,
    totalTasksDone,
    totalSessions,
  };
}
