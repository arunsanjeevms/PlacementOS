import { z } from "zod";
import { DIFFICULTIES, RESOURCE_TYPES } from "../constants/enums.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createResourceSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z.string().trim().url(),
  description: z.string().max(2000).optional(),
  type: z.enum(RESOURCE_TYPES).default("website"),
  category: z.string().max(60).optional(),
  subject: z.string().max(60).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  notes: z.string().max(5000).optional(),
  folder: z.string().max(60).optional(),
  previewImage: z.string().url().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  pinned: z.boolean().optional(),
  favorite: z.boolean().optional(),
  completed: z.boolean().optional(),
  relatedTask: objectId.nullable().optional(),
  relatedTopic: objectId.nullable().optional(),
  relatedCompany: objectId.nullable().optional(),
});

export const updateResourceSchema = createResourceSchema.partial();

export const listResourceQuerySchema = z.object({
  type: z.enum(RESOURCE_TYPES).optional(),
  category: z.string().optional(),
  subject: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  tag: z.string().optional(),
  folder: z.string().optional(),
  favorite: z.coerce.boolean().optional(),
  pinned: z.coerce.boolean().optional(),
  completed: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export const bulkSchema = z.object({
  ids: z.array(objectId).min(1),
  action: z.enum(["delete", "favorite", "unfavorite", "complete", "uncomplete", "pin", "unpin", "move"]),
  folder: z.string().max(60).optional(),
});

export const importSchema = z.object({
  resources: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(300),
        url: z.string().trim().url(),
        description: z.string().max(2000).optional(),
        type: z.enum(RESOURCE_TYPES).optional(),
        category: z.string().optional(),
        subject: z.string().optional(),
        difficulty: z.enum(DIFFICULTIES).optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        folder: z.string().optional(),
        rating: z.number().optional(),
      })
    )
    .max(2000),
});
