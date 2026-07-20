import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody, zDate } from "../lib/http.js";

const router = Router();

const taskFields = {
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  scope: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]).optional(),
  estimateMin: z.number().int().min(0).optional(),
  actualMin: z.number().int().min(0).optional(),
  deadline: zDate,
  scheduledFor: z.string().nullable().optional(),
  repeat: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
  notes: z.string().optional(),
  order: z.number().int().optional(),
  completedDate: z.string().nullable().optional(),
};
const createSchema = z.object(taskFields);
const updateSchema = z.object({ ...taskFields, title: z.string().min(1).optional() });

const include = { subtasks: { orderBy: { order: "asc" as const } }, attachments: true };

router.get(
  "/",
  asyncH(async (req, res) => {
    const userId = uid(req);
    const { scope, status, scheduledFor, from, to, category, search } = req.query as Record<string, string>;
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(scope && { scope: scope as never }),
        ...(status ? { status: status as never } : { status: { not: "ARCHIVED" } }),
        ...(scheduledFor && { scheduledFor }),
        ...(from && { scheduledFor: { gte: from, ...(to && { lte: to }) } }),
        ...(category && { category }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
      },
      include,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    res.json(tasks);
  })
);

router.post(
  "/",
  asyncH(async (req, res) => {
    const data = parseBody(createSchema, req);
    const task = await prisma.task.create({ data: { ...data, userId: uid(req) }, include });
    res.status(201).json(task);
  })
);

router.patch(
  "/reorder",
  asyncH(async (req, res) => {
    const { items } = parseBody(
      z.object({ items: z.array(z.object({ id: z.string(), order: z.number().int(), status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]).optional(), scheduledFor: z.string().optional() })) }),
      req
    );
    const userId = uid(req);
    await prisma.$transaction(
      items.map((i) =>
        prisma.task.updateMany({
          where: { id: i.id, userId },
          data: { order: i.order, ...(i.status && { status: i.status }), ...(i.scheduledFor && { scheduledFor: i.scheduledFor }) },
        })
      )
    );
    res.json({ ok: true });
  })
);

router.patch(
  "/:id",
  asyncH(async (req, res) => {
    const data = parseBody(updateSchema, req);
    const userId = uid(req);
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) return res.status(404).json({ error: "Task not found" });

    const patch: Record<string, unknown> = { ...data };
    if (data.status === "DONE" && existing.status !== "DONE") {
      patch.completedAt = new Date();
      patch.completedDate = data.completedDate ?? new Date().toISOString().slice(0, 10);
    } else if (data.status && data.status !== "DONE") {
      patch.completedAt = null;
      patch.completedDate = null;
    }

    const task = await prisma.task.update({ where: { id: existing.id }, data: patch, include });

    // Repeat: when a repeating task completes, clone it to the next occurrence.
    if (data.status === "DONE" && existing.repeat !== "NONE" && existing.scheduledFor) {
      const base = new Date(existing.scheduledFor + "T00:00:00Z");
      const days = existing.repeat === "DAILY" ? 1 : existing.repeat === "WEEKLY" ? 7 : 30;
      const next = new Date(base.getTime() + days * 86400000).toISOString().slice(0, 10);
      const dup = await prisma.task.findFirst({ where: { userId, title: existing.title, scheduledFor: next } });
      if (!dup) {
        await prisma.task.create({
          data: {
            userId,
            title: existing.title,
            description: existing.description,
            category: existing.category,
            priority: existing.priority,
            difficulty: existing.difficulty,
            scope: existing.scope,
            estimateMin: existing.estimateMin,
            repeat: existing.repeat,
            tags: existing.tags,
            links: existing.links,
            scheduledFor: next,
          },
        });
      }
    }
    res.json(task);
  })
);

router.delete(
  "/:id",
  asyncH(async (req, res) => {
    await prisma.task.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

// ---- Subtasks ----
router.post(
  "/:id/subtasks",
  asyncH(async (req, res) => {
    const { title } = parseBody(z.object({ title: z.string().min(1) }), req);
    const userId = uid(req);
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
    if (!task) return res.status(404).json({ error: "Task not found" });
    const count = await prisma.subtask.count({ where: { taskId: task.id } });
    const subtask = await prisma.subtask.create({ data: { userId, taskId: task.id, title, order: count } });
    res.status(201).json(subtask);
  })
);

router.patch(
  "/subtasks/:id",
  asyncH(async (req, res) => {
    const data = parseBody(z.object({ title: z.string().optional(), done: z.boolean().optional(), order: z.number().int().optional() }), req);
    await prisma.subtask.updateMany({ where: { id: req.params.id, userId: uid(req) }, data });
    res.json({ ok: true });
  })
);

router.delete(
  "/subtasks/:id",
  asyncH(async (req, res) => {
    await prisma.subtask.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
