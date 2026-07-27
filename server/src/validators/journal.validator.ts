import { z } from "zod";
import { JOURNAL_TYPES, OUTCOMES } from "../models/Journal.js";

export const createJournalSchema = z.object({
  type: z.enum(JOURNAL_TYPES).default("real"),
  company: z.string().trim().min(1).max(120),
  role: z.string().max(120).optional(),
  date: z.coerce.date(),
  round: z.string().max(120).optional(),
  interviewer: z.string().max(120).optional(),
  questionsAsked: z.array(z.string().max(1000)).max(100).optional(),
  questionsMissed: z.array(z.string().max(1000)).max(100).optional(),
  mistakes: z.string().max(5000).optional(),
  conceptsToRevise: z.array(z.string().max(500)).max(100).optional(),
  confidence: z.coerce.number().int().min(1).max(5).optional(),
  outcome: z.enum(OUTCOMES).optional(),
  feedback: z.string().max(5000).optional(),
  nextAction: z.string().max(2000).optional(),
});

export const updateJournalSchema = createJournalSchema.partial();

export const listJournalQuerySchema = z.object({
  type: z.enum(JOURNAL_TYPES).optional(),
  outcome: z.enum(OUTCOMES).optional(),
  search: z.string().trim().optional(),
});
