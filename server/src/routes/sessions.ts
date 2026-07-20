import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody, zDate } from "../lib/http.js";

const router = Router();

const sessionSchema = z.object({
  taskId: z.string().nullable().optional(),
  startedAt: zDate,
  endedAt: zDate,
  durationMin: z.number().int().min(0),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  subject: z.string().optional(),
  preset: z.string().optional(),
  isPomodoro: z.boolean().optional(),
  notes: z.string().optional(),
  mood: z.string().optional(),
  productivity: z.number().int().min(0).max(5).optional(),
});

router.get(
  "/",
  asyncH(async (req, res) => {
    const { from, to, dateKey } = req.query as Record<string, string>;
    const sessions = await prisma.studySession.findMany({
      where: {
        userId: uid(req),
        ...(dateKey && { dateKey }),
        ...(from && { dateKey: { gte: from, ...(to && { lte: to }) } }),
      },
      include: { task: { select: { id: true, title: true } } },
      orderBy: { startedAt: "desc" },
      take: 200,
    });
    res.json(sessions);
  })
);

router.post(
  "/",
  asyncH(async (req, res) => {
    const data = parseBody(sessionSchema, req);
    const session = await prisma.studySession.create({
      data: { ...data, startedAt: data.startedAt ?? new Date(), userId: uid(req) },
    });
    res.status(201).json(session);
  })
);

router.patch(
  "/:id",
  asyncH(async (req, res) => {
    const data = parseBody(sessionSchema.partial(), req);
    const existing = await prisma.studySession.findFirst({ where: { id: req.params.id, userId: uid(req) } });
    if (!existing) return res.status(404).json({ error: "Session not found" });
    const session = await prisma.studySession.update({
      where: { id: existing.id },
      data: { ...data, startedAt: data.startedAt ?? undefined },
    });
    res.json(session);
  })
);

router.delete(
  "/:id",
  asyncH(async (req, res) => {
    await prisma.studySession.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
