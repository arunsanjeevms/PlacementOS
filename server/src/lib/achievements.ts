import { prisma } from "./prisma.js";
import { computeStreaks, getActivityMap } from "./stats.js";

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  metric: "streak" | "hours" | "tasks" | "leetcode" | "projects" | "mocks" | "pomodoros" | "notes";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "streak-7", title: "One Week Warrior", description: "Maintain a 7 day streak", icon: "flame", target: 7, metric: "streak" },
  { key: "streak-30", title: "Monthly Machine", description: "Maintain a 30 day streak", icon: "flame", target: 30, metric: "streak" },
  { key: "streak-100", title: "Centurion", description: "Maintain a 100 day streak", icon: "flame", target: 100, metric: "streak" },
  { key: "hours-100", title: "Century of Hours", description: "Study for 100 total hours", icon: "clock", target: 100, metric: "hours" },
  { key: "hours-500", title: "Deep Worker", description: "Study for 500 total hours", icon: "clock", target: 500, metric: "hours" },
  { key: "hours-1000", title: "Ten Thousand Steps", description: "Study for 1000 total hours", icon: "clock", target: 1000, metric: "hours" },
  { key: "tasks-100", title: "Task Slayer", description: "Complete 100 tasks", icon: "check", target: 100, metric: "tasks" },
  { key: "tasks-500", title: "Unstoppable", description: "Complete 500 tasks", icon: "check", target: 500, metric: "tasks" },
  { key: "leetcode-100", title: "LeetCode Hundred", description: "Solve 100 DSA problems", icon: "code", target: 100, metric: "leetcode" },
  { key: "leetcode-300", title: "Problem Crusher", description: "Solve 300 DSA problems", icon: "code", target: 300, metric: "leetcode" },
  { key: "project-1", title: "Builder", description: "Complete your first project", icon: "rocket", target: 1, metric: "projects" },
  { key: "mock-1", title: "Face the Fire", description: "Complete your first mock interview", icon: "mic", target: 1, metric: "mocks" },
  { key: "pomodoro-100", title: "Tomato Farmer", description: "Complete 100 pomodoro sessions", icon: "timer", target: 100, metric: "pomodoros" },
  { key: "notes-50", title: "Knowledge Keeper", description: "Create 50 notes", icon: "book", target: 50, metric: "notes" },
];

export async function evaluateAchievements(userId: string, todayKey: string) {
  const [activity, dsaTopics, projectsDone, mocks, pomodoros, notes, unlocked] = await Promise.all([
    getActivityMap(userId),
    prisma.topicProgress.findMany({ where: { userId, track: "DSA" } }),
    prisma.project.count({ where: { userId, status: "COMPLETED" } }),
    prisma.mockInterview.count({ where: { userId } }),
    prisma.studySession.count({ where: { userId, isPomodoro: true } }),
    prisma.note.count({ where: { userId } }),
    prisma.achievement.findMany({ where: { userId } }),
  ]);

  const streaks = computeStreaks(activity, todayKey);
  const totalMinutes = [...activity.values()].reduce((a, d) => a + d.minutes, 0);
  const totalTasks = [...activity.values()].reduce((a, d) => a + d.tasksDone, 0);
  const leetcode = dsaTopics.reduce((a, t) => a + t.solvedEasy + t.solvedMed + t.solvedHard, 0);

  const values: Record<AchievementDef["metric"], number> = {
    streak: Math.max(streaks.current, streaks.longest),
    hours: Math.floor(totalMinutes / 60),
    tasks: totalTasks,
    leetcode,
    projects: projectsDone,
    mocks,
    pomodoros,
    notes,
  };

  const unlockedKeys = new Set(unlocked.map((a) => a.key));
  const newlyUnlocked: string[] = [];
  for (const def of ACHIEVEMENTS) {
    if (!unlockedKeys.has(def.key) && values[def.metric] >= def.target) {
      await prisma.achievement.create({ data: { userId, key: def.key } });
      newlyUnlocked.push(def.key);
    }
  }

  return {
    definitions: ACHIEVEMENTS.map((def) => ({
      ...def,
      value: Math.min(values[def.metric], def.target),
      unlocked: unlockedKeys.has(def.key) || newlyUnlocked.includes(def.key),
      unlockedAt: unlocked.find((a) => a.key === def.key)?.unlockedAt ?? null,
    })),
    newlyUnlocked,
  };
}
