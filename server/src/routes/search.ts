import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH } from "../lib/http.js";

const router = Router();

router.get(
  "/",
  asyncH(async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return res.json({ tasks: [], notes: [], projects: [], resources: [], companies: [], bookmarks: [] });
    const userId = uid(req);
    const contains = { contains: q, mode: "insensitive" as const };

    const [tasks, notes, projects, resources, companies, bookmarks] = await Promise.all([
      prisma.task.findMany({
        where: { userId, status: { not: "ARCHIVED" }, OR: [{ title: contains }, { description: contains }, { tags: { has: q } }] },
        select: { id: true, title: true, category: true, status: true, scope: true },
        take: 8,
      }),
      prisma.note.findMany({
        where: { userId, OR: [{ title: contains }, { content: contains }, { tags: { has: q } }] },
        select: { id: true, title: true, category: true },
        take: 8,
      }),
      prisma.project.findMany({
        where: { userId, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, status: true },
        take: 5,
      }),
      prisma.resource.findMany({
        where: { userId, OR: [{ title: contains }, { description: contains }, { url: contains }] },
        select: { id: true, title: true, url: true, type: true },
        take: 8,
      }),
      prisma.company.findMany({
        where: { userId, name: contains },
        select: { id: true, name: true, stage: true },
        take: 5,
      }),
      prisma.bookmark.findMany({
        where: { userId, OR: [{ title: contains }, { url: contains }] },
        select: { id: true, title: true, url: true, kind: true },
        take: 5,
      }),
    ]);

    res.json({ tasks, notes, projects, resources, companies, bookmarks });
  })
);

export default router;
