import { z } from "zod";
import { DIFFICULTIES, PRIORITIES, REPEAT_RULES, TASK_SCOPES, TASK_STATUSES } from "../constants/enums.js";

const linkSchema = z.object({
  label: z.string().trim().min(1).max(120),
  url: z.string().trim().url(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().max(5000).optional(),
  priority: z.enum(PRIORITIES).default("medium"),
  difficulty: z.enum(DIFFICULTIES).optional(),
  category: z.string().trim().max(60).default("Custom"),
  scope: z.enum(TASK_SCOPES).default("daily"),
  status: z.enum(TASK_STATUSES).default("todo"),
  date: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  estimatedMinutes: z.coerce.number().int().min(0).max(6000).optional(),
  actualMinutes: z.coerce.number().int().min(0).max(6000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  links: z.array(linkSchema).max(20).default([]),
  notes: z.string().max(10000).optional(),
  subtasks: z.array(z.object({ title: z.string().trim().min(1).max(300), done: z.boolean().default(false) })).default([]),
  repeat: z.enum(REPEAT_RULES).default("none"),
  pinned: z.boolean().default(false),
  order: z.number().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const listTaskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  scope: z.enum(TASK_SCOPES).optional(),
  category: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
  tag: z.string().optional(),
  pinned: z.coerce.boolean().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/), order: z.number(), status: z.enum(TASK_STATUSES).optional() })),
});

export const subtaskSchema = z.object({ title: z.string().trim().min(1).max(300) });
