import { Types } from "mongoose";
import { Topic } from "../models/Topic.js";
import { DEFAULT_TOPICS, DSA_DEFAULT_TOTALS } from "../constants/defaultTopics.js";
import { TRACKER_KINDS, type TrackerKind } from "../constants/enums.js";
import { registerSeeder } from "./seed.service.js";

/** Create the default topic set for a new user across all three trackers. */
export async function seedTopicsForUser(userId: string): Promise<void> {
  const existing = await Topic.countDocuments({ user: userId });
  if (existing > 0) return;

  const docs = TRACKER_KINDS.flatMap((kind) =>
    DEFAULT_TOPICS[kind].map((name, i) => ({
      user: new Types.ObjectId(userId),
      kind,
      name,
      order: i,
      ...(kind === "dsa"
        ? {
            easy: { solved: 0, total: DSA_DEFAULT_TOTALS.easy },
            medium: { solved: 0, total: DSA_DEFAULT_TOTALS.medium },
            hard: { solved: 0, total: DSA_DEFAULT_TOTALS.hard },
          }
        : {}),
    }))
  );
  await Topic.insertMany(docs);
}

// Register with the sign-up seeder pipeline (runs once when this module loads).
registerSeeder(seedTopicsForUser);

export interface TrackerSummary {
  kind: TrackerKind;
  totalTopics: number;
  completedTopics: number;
  weakTopics: number;
  progress: number; // 0–100
  // DSA specifics
  solved?: number;
  total?: number;
  byDifficulty?: { easy: { solved: number; total: number }; medium: { solved: number; total: number }; hard: { solved: number; total: number } };
  // Aptitude specifics
  avgAccuracy?: number;
  totalSolved?: number;
  practiceMinutes?: number;
}

/** Compute a normalized progress summary for a tracker. */
export async function getTrackerSummary(userId: string, kind: TrackerKind): Promise<TrackerSummary> {
  const topics = await Topic.find({ user: userId, kind });
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.status === "completed").length;
  const weakTopics = topics.filter((t) => t.isWeak).length;

  const base: TrackerSummary = { kind, totalTopics, completedTopics, weakTopics, progress: 0 };
  if (totalTopics === 0) return base;

  if (kind === "java") {
    base.progress = Math.round(topics.reduce((s, t) => s + t.completion, 0) / totalTopics);
  } else if (kind === "dsa") {
    const acc = { easy: { solved: 0, total: 0 }, medium: { solved: 0, total: 0 }, hard: { solved: 0, total: 0 } };
    for (const t of topics) {
      acc.easy.solved += t.easy.solved;
      acc.easy.total += t.easy.total;
      acc.medium.solved += t.medium.solved;
      acc.medium.total += t.medium.total;
      acc.hard.solved += t.hard.solved;
      acc.hard.total += t.hard.total;
    }
    const solved = acc.easy.solved + acc.medium.solved + acc.hard.solved;
    const total = acc.easy.total + acc.medium.total + acc.hard.total;
    base.solved = solved;
    base.total = total;
    base.byDifficulty = acc;
    base.progress = total > 0 ? Math.round((solved / total) * 100) : 0;
  } else {
    const totalSolved = topics.reduce((s, t) => s + t.solved, 0);
    const withAcc = topics.filter((t) => t.solved > 0);
    const avgAccuracy = withAcc.length ? Math.round(withAcc.reduce((s, t) => s + t.accuracy, 0) / withAcc.length) : 0;
    base.totalSolved = totalSolved;
    base.avgAccuracy = avgAccuracy;
    base.practiceMinutes = topics.reduce((s, t) => s + t.practiceMinutes, 0);
    base.progress = Math.round((completedTopics / totalTopics) * 100);
  }
  return base;
}
