import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createFolderSchema = z.object({
  name: z.string().trim().min(1).max(100),
  parent: objectId.nullable().optional(),
  color: z.string().max(20).optional(),
});
export const updateFolderSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  parent: objectId.nullable().optional(),
  color: z.string().max(20).optional(),
  order: z.number().optional(),
});

export const createNoteSchema = z.object({
  title: z.string().trim().max(300).optional(),
  content: z.string().max(500000).optional(),
  contentText: z.string().max(500000).optional(),
  folder: objectId.nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  category: z.string().max(60).optional(),
  relatedProject: objectId.nullable().optional(),
  relatedTask: objectId.nullable().optional(),
  relatedCompany: objectId.nullable().optional(),
});

export const updateNoteSchema = createNoteSchema.extend({
  pinned: z.boolean().optional(),
  favorite: z.boolean().optional(),
  archived: z.boolean().optional(),
  trashed: z.boolean().optional(),
});

export const listNoteQuerySchema = z.object({
  folder: z.string().optional(), // objectId or "none"
  tag: z.string().optional(),
  filter: z.enum(["all", "favorite", "pinned", "archived", "trash"]).default("all"),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  page: z.coerce.number().int().min(1).default(1),
});
