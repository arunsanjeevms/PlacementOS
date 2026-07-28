/** Shared enum values used across models & validators. */

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
  "Projects",
  "Resume",
  "Interview",
  "Communication",
  "System Design",
  "Operating Systems",
  "DBMS",
  "CN",
  "HR",
  "Custom",
] as const;

export const PROJECT_STATUSES = ["todo", "in_progress", "testing", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const COMPANY_STATUSES = [
  "wishlist",
  "preparing",
  "applied",
  "online_assessment",
  "interview",
  "offer",
  "rejected",
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const TRACKER_KINDS = ["java", "dsa", "aptitude", "core"] as const;
export type TrackerKind = (typeof TRACKER_KINDS)[number];

export const RESOURCE_TYPES = [
  "website",
  "github",
  "youtube_video",
  "youtube_playlist",
  "documentation",
  "article",
  "course",
  "pdf",
  "drive",
  "linkedin",
  "twitter",
  "leetcode",
  "geeksforgeeks",
  "codeforces",
  "hackerrank",
  "interview_experience",
  "cheat_sheet",
  "roadmap",
  "practice_platform",
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];
