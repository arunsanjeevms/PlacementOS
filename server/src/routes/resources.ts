import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody } from "../lib/http.js";

const router = Router();

const resourceSchema = z.object({
  siteName: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().min(1),
  type: z
    .enum(["WEBSITE", "PDF", "VIDEO", "YOUTUBE_PLAYLIST", "COURSE", "GITHUB_REPO", "LEETCODE_PROBLEM", "ARTICLE", "DOCUMENTATION", "CHEAT_SHEET", "PRACTICE_PLATFORM", "COMPANY_PREP"])
    .optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  favorite: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

router.get(
  "/",
  asyncH(async (req, res) => {
    const resources = await prisma.resource.findMany({
      where: { userId: uid(req) },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    res.json(resources);
  })
);

router.post(
  "/",
  asyncH(async (req, res) => {
    const data = parseBody(resourceSchema, req);
    const resource = await prisma.resource.create({ data: { ...data, userId: uid(req) } });
    res.status(201).json(resource);
  })
);

router.patch(
  "/:id",
  asyncH(async (req, res) => {
    const data = parseBody(resourceSchema.partial(), req);
    const userId = uid(req);
    await prisma.resource.updateMany({ where: { id: req.params.id, userId }, data });
    const resource = await prisma.resource.findFirst({ where: { id: req.params.id, userId } });
    res.json(resource);
  })
);

router.delete(
  "/:id",
  asyncH(async (req, res) => {
    await prisma.resource.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
