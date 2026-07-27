import type { Difficulty, Priority, RepeatRule, TaskScope, TaskStatus } from "@/constants/tasks";

export interface Subtask {
  _id: string;
  title: string;
  done: boolean;
}

export interface TaskLink {
  label: string;
  url: string;
}

export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string;
  priority: Priority;
  difficulty?: Difficulty;
  category: string;
  scope: TaskScope;
  status: TaskStatus;
  date?: string;
  deadline?: string;
  estimatedMinutes?: number;
  actualMinutes: number;
  tags: string[];
  links: TaskLink[];
  notes?: string;
  subtasks: Subtask[];
  repeat: RepeatRule;
  order: number;
  pinned: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummary {
  statusCounts: Partial<Record<TaskStatus, number>>;
  todayTotal: number;
  todayDone: number;
  overdue: number;
  upcoming: number;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  difficulty?: Difficulty;
  category?: string;
  scope?: TaskScope;
  status?: TaskStatus;
  date?: string | null;
  deadline?: string | null;
  estimatedMinutes?: number;
  tags?: string[];
  links?: TaskLink[];
  notes?: string;
  repeat?: RepeatRule;
  pinned?: boolean;
}
