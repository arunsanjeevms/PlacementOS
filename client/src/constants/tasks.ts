export const TASK_STATUSES = ["todo", "in_progress", "done", "archived"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_SCOPES = ["daily", "weekly", "monthly"] as const;
export type TaskScope = (typeof TASK_SCOPES)[number];

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const REPEAT_RULES = ["none", "daily", "weekly", "monthly"] as const;
export type RepeatRule = (typeof REPEAT_RULES)[number];

export const TASK_CATEGORIES = [
  "Java",
  "DSA",
  "Aptitude",
  "Reasoning",
  "Verbal",
  "SQL",
  "DBMS",
  "Operating Systems",
  "CN",
  "OOPS",
  "System Design",
  "Projects",
  "Resume",
  "Interview",
  "HR",
  "Communication",
  "Git",
  "Custom",
] as const;

/** Column definitions for the kanban board (archived is hidden from the board). */
export const STATUS_META: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  todo: { label: "To Do", dot: "bg-slate-400", text: "text-slate-400" },
  in_progress: { label: "In Progress", dot: "bg-blue-500", text: "text-blue-500" },
  done: { label: "Done", dot: "bg-emerald-500", text: "text-emerald-500" },
  archived: { label: "Archived", dot: "bg-zinc-500", text: "text-zinc-500" },
};

export const PRIORITY_META: Record<Priority, { label: string; className: string; bar: string }> = {
  low: { label: "Low", className: "text-slate-400 bg-slate-500/12", bar: "bg-slate-400" },
  medium: { label: "Medium", className: "text-blue-400 bg-blue-500/12", bar: "bg-blue-500" },
  high: { label: "High", className: "text-amber-400 bg-amber-500/12", bar: "bg-amber-500" },
  urgent: { label: "Urgent", className: "text-rose-400 bg-rose-500/12", bar: "bg-rose-500" },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: "Easy", className: "text-emerald-400 bg-emerald-500/12" },
  medium: { label: "Medium", className: "text-amber-400 bg-amber-500/12" },
  hard: { label: "Hard", className: "text-rose-400 bg-rose-500/12" },
};

/** Stable hue per category for the colored dot/chip. */
export const CATEGORY_HUE: Record<string, number> = {
  Java: 25,
  DSA: 262,
  Aptitude: 160,
  Reasoning: 175,
  Verbal: 88,
  SQL: 200,
  DBMS: 12,
  "Operating Systems": 130,
  CN: 205,
  OOPS: 55,
  "System Design": 190,
  Projects: 217,
  Resume: 340,
  Interview: 291,
  HR: 320,
  Communication: 47,
  Git: 8,
  Custom: 240,
};
