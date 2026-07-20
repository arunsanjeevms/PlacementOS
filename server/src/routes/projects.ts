import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody, zDate } from "../lib/http.js";

const router = Router();

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "TESTING", "COMPLETED"]).optional(),
  techStack: z.array(z.string()).optional(),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  deployment: z.string().optional(),
  deadline: zDate,
  notes: z.string().optional(),
  order: z.number().int().optional(),
});

const include = { milestones: { orderBy: { order: "asc" as const } } };

router.get(
  "/",
  asyncH(async (req, res) => {
    const projects = await prisma.project.findMany({
      where: { userId: uid(req) },
      include,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    res.json(projects);
  })
);

router.post(
  "/",
  asyncH(async (req, res) => {
    const data = parseBody(projectSchema, req);
    const project = await prisma.project.create({ data: { ...data, userId: uid(req) }, include });
    res.status(201).json(project);
  })
);

router.patch(
  "/:id",
  asyncH(async (req, res) => {
    const data = parseBody(projectSchema.partial(), req);
    const userId = uid(req);
    await prisma.project.updateMany({ where: { id: req.params.id, userId }, data });
    const project = await prisma.project.findFirst({ where: { id: req.params.id, userId }, include });
    res.json(project);
  })
);

router.delete(
  "/:id",
  asyncH(async (req, res) => {
    await prisma.project.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

router.post(
  "/:id/milestones",
  asyncH(async (req, res) => {
    const data = parseBody(z.object({ title: z.string().min(1), dueDate: zDate }), req);
    const userId = uid(req);
    const project = await prisma.project.findFirst({ where: { id: req.params.id, userId } });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const count = await prisma.milestone.count({ where: { projectId: project.id } });
    const milestone = await prisma.milestone.create({
      data: { userId, projectId: project.id, title: data.title, dueDate: data.dueDate, order: count },
    });
    res.status(201).json(milestone);
  })
);

router.patch(
  "/milestones/:id",
  asyncH(async (req, res) => {
    const data = parseBody(z.object({ title: z.string().optional(), done: z.boolean().optional(), dueDate: zDate, order: z.number().int().optional() }), req);
    await prisma.milestone.updateMany({ where: { id: req.params.id, userId: uid(req) }, data });
    res.json({ ok: true });
  })
);

router.delete(
  "/milestones/:id",
  asyncH(async (req, res) => {
    await prisma.milestone.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
