import { z } from "zod";
import { SESSION_MODES, MOODS } from "../models/Session.js";

export const createSessionSchema = z.object({
  category: z.string().trim().max(60).default("DSA"),
  task: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  taskTitle: z.string().trim().max(300).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  mode: z.enum(SESSION_MODES).default("25/5"),
  productivity: z.coerce.number().int().min(1).max(5).optional(),
  mood: z.enum(MOODS).optional(),
  notes: z.string().max(2000).optional(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional(),
  dateKey: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const updateSessionSchema = z.object({
  category: z.string().trim().max(60).optional(),
  productivity: z.coerce.number().int().min(1).max(5).optional(),
  mood: z.enum(MOODS).optional(),
  notes: z.string().max(2000).optional(),
});

export const listSessionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().optional(),
});
