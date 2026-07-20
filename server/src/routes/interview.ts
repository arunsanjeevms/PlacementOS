import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody, zDate } from "../lib/http.js";

const router = Router();

const questionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().optional(),
  category: z.enum(["HR", "TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "CODING"]).optional(),
  company: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  mastered: z.boolean().optional(),
  favorite: z.boolean().optional(),
});

const mockSchema = z.object({
  date: zDate,
  type: z.string().optional(),
  company: z.string().optional(),
  rating: z.number().int().min(0).max(5).optional(),
  notes: z.string().optional(),
});

router.get(
  "/questions",
  asyncH(async (req, res) => {
    const questions = await prisma.interviewQuestion.findMany({ where: { userId: uid(req) }, orderBy: { createdAt: "desc" } });
    res.json(questions);
  })
);

router.post(
  "/questions",
  asyncH(async (req, res) => {
    const data = parseBody(questionSchema, req);
    const question = await prisma.interviewQuestion.create({ data: { ...data, userId: uid(req) } });
    res.status(201).json(question);
  })
);

router.patch(
  "/questions/:id",
  asyncH(async (req, res) => {
    const data = parseBody(questionSchema.partial(), req);
    await prisma.interviewQuestion.updateMany({ where: { id: req.params.id, userId: uid(req) }, data });
    res.json({ ok: true });
  })
);

router.delete(
  "/questions/:id",
  asyncH(async (req, res) => {
    await prisma.interviewQuestion.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

router.get(
  "/mocks",
  asyncH(async (req, res) => {
    const mocks = await prisma.mockInterview.findMany({ where: { userId: uid(req) }, orderBy: { date: "desc" } });
    res.json(mocks);
  })
);

router.post(
  "/mocks",
  asyncH(async (req, res) => {
    const data = parseBody(mockSchema, req);
    const mock = await prisma.mockInterview.create({ data: { ...data, date: data.date ?? new Date(), userId: uid(req) } });
    res.status(201).json(mock);
  })
);

router.patch(
  "/mocks/:id",
  asyncH(async (req, res) => {
    const data = parseBody(mockSchema.partial(), req);
    await prisma.mockInterview.updateMany({
      where: { id: req.params.id, userId: uid(req) },
      data: { ...data, date: data.date ?? undefined },
    });
    res.json({ ok: true });
  })
);

router.delete(
  "/mocks/:id",
  asyncH(async (req, res) => {
    await prisma.mockInterview.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
