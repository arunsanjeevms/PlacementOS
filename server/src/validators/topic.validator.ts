import { z } from "zod";
import { TRACKER_KINDS } from "../constants/enums.js";
import { TOPIC_STATUSES } from "../models/Topic.js";

const count = z.object({ solved: z.coerce.number().int().min(0), total: z.coerce.number().int().min(0) });
const link = z.object({ label: z.string().trim().min(1).max(120), url: z.string().trim().url() });

export const createTopicSchema = z.object({
  kind: z.enum(TRACKER_KINDS),
  name: z.string().trim().min(1).max(120),
  status: z.enum(TOPIC_STATUSES).optional(),
});

export const updateTopicSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(TOPIC_STATUSES).optional(),
  completion: z.coerce.number().min(0).max(100).optional(),
  practiceQuestions: z.coerce.number().int().min(0).optional(),
  easy: count.optional(),
  medium: count.optional(),
  hard: count.optional(),
  solved: z.coerce.number().int().min(0).optional(),
  accuracy: z.coerce.number().min(0).max(100).optional(),
  practiceMinutes: z.coerce.number().min(0).optional(),
  avgTimeSeconds: z.coerce.number().min(0).optional(),
  revisionCount: z.coerce.number().int().min(0).optional(),
  isWeak: z.boolean().optional(),
  notes: z.string().max(10000).optional(),
  bookmarks: z.array(link).max(50).optional(),
  resources: z.array(link).max(50).optional(),
});

export const listTopicQuerySchema = z.object({ kind: z.enum(TRACKER_KINDS) });
export const reorderTopicSchema = z.object({
  items: z.array(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/), order: z.number() })),
});
