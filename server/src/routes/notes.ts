import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody, zDate } from "../lib/http.js";

const router = Router();

const noteSchema = z.object({
  folderId: z.string().nullable().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  favorite: z.boolean().optional(),
  archived: z.boolean().optional(),
  taskId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
  revisionDate: zDate,
});

const folderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

const bookmarkSchema = z.object({
  noteId: z.string().nullable().optional(),
  title: z.string().min(1),
  url: z.string().min(1),
  kind: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ---- Folders ----
router.get(
  "/folders",
  asyncH(async (req, res) => {
    const folders = await prisma.folder.findMany({ where: { userId: uid(req) }, orderBy: { order: "asc" } });
    res.json(folders);
  })
);

router.post(
  "/folders",
  asyncH(async (req, res) => {
    const data = parseBody(folderSchema, req);
    const folder = await prisma.folder.create({ data: { ...data, userId: uid(req) } });
    res.status(201).json(folder);
  })
);

router.patch(
  "/folders/:id",
  asyncH(async (req, res) => {
    const data = parseBody(folderSchema.partial(), req);
    await prisma.folder.updateMany({ where: { id: req.params.id, userId: uid(req) }, data });
    res.json({ ok: true });
  })
);

router.delete(
  "/folders/:id",
  asyncH(async (req, res) => {
    const userId = uid(req);
    // Re-parent children and notes to root, then delete.
    await prisma.folder.updateMany({ where: { parentId: req.params.id, userId }, data: { parentId: null } });
    await prisma.note.updateMany({ where: { folderId: req.params.id, userId }, data: { folderId: null } });
    await prisma.folder.deleteMany({ where: { id: req.params.id, userId } });
    res.json({ ok: true });
  })
);

// ---- Bookmarks ----
router.get(
  "/bookmarks",
  asyncH(async (req, res) => {
    const bookmarks = await prisma.bookmark.findMany({ where: { userId: uid(req) }, orderBy: { createdAt: "desc" } });
    res.json(bookmarks);
  })
);

router.post(
  "/bookmarks",
  asyncH(async (req, res) => {
    const data = parseBody(bookmarkSchema, req);
    const bookmark = await prisma.bookmark.create({ data: { ...data, userId: uid(req) } });
    res.status(201).json(bookmark);
  })
);

router.delete(
  "/bookmarks/:id",
  asyncH(async (req, res) => {
    await prisma.bookmark.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

// ---- Notes ----
router.get(
  "/",
  asyncH(async (req, res) => {
    const { archived } = req.query as Record<string, string>;
    const notes = await prisma.note.findMany({
      where: { userId: uid(req), archived: archived === "true" },
      include: { bookmarks: true },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });
    res.json(notes);
  })
);

router.post(
  "/",
  asyncH(async (req, res) => {
    const data = parseBody(noteSchema, req);
    const note = await prisma.note.create({ data: { ...data, userId: uid(req) }, include: { bookmarks: true } });
    res.status(201).json(note);
  })
);

router.patch(
  "/:id",
  asyncH(async (req, res) => {
    const data = parseBody(noteSchema.partial(), req);
    const userId = uid(req);
    await prisma.note.updateMany({ where: { id: req.params.id, userId }, data });
    const note = await prisma.note.findFirst({ where: { id: req.params.id, userId }, include: { bookmarks: true } });
    res.json(note);
  })
);

router.delete(
  "/:id",
  asyncH(async (req, res) => {
    await prisma.note.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
