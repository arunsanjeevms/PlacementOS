import { z } from "zod";
import { PROJECT_STATUSES } from "../constants/enums.js";

const link = z.object({ label: z.string().trim().min(1).max(120), url: z.string().trim().url() });

export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(PROJECT_STATUSES).default("todo"),
  githubUrl: z.string().trim().url().or(z.literal("")).optional(),
  liveUrl: z.string().trim().url().or(z.literal("")).optional(),
  techStack: z.array(z.string().trim().min(1).max(40)).max(40).default([]),
  deadline: z.coerce.date().optional(),
  screenshots: z.array(z.string().trim().url()).max(20).default([]),
  notes: z.string().max(10000).optional(),
  resources: z.array(link).max(50).default([]),
  pinned: z.boolean().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const checklistSchema = z.object({ title: z.string().trim().min(1).max(300), dueDate: z.coerce.date().optional() });

export const reorderProjectSchema = z.object({
  items: z.array(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/), order: z.number(), status: z.enum(PROJECT_STATUSES).optional() })),
});
