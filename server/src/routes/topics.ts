import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody } from "../lib/http.js";
import { DEFAULT_TOPICS } from "../lib/defaultTopics.js";

const router = Router();

const topicSchema = z.object({
  progress: z.number().int().min(0).max(100).optional(),
  solvedEasy: z.number().int().min(0).optional(),
  solvedMed: z.number().int().min(0).optional(),
  solvedHard: z.number().int().min(0).optional(),
  solved: z.number().int().min(0).optional(),
  accuracy: z.number().int().min(0).max(100).optional(),
  avgTimeSec: z.number().int().min(0).optional(),
  revisions: z.number().int().min(0).optional(),
  weak: z.boolean().optional(),
  notes: z.string().optional(),
  bookmarks: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
  resources: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
});

/** Get all topics for a track, lazily seeding defaults for new users. */
router.get(
  "/:track",
  asyncH(async (req, res) => {
    const track = req.params.track.toUpperCase() as "JAVA" | "DSA" | "APTITUDE";
    if (!["JAVA", "DSA", "APTITUDE"].includes(track)) return res.status(400).json({ error: "Bad track" });
    const userId = uid(req);

    const existing = await prisma.topicProgress.findMany({ where: { userId, track } });
    const have = new Set(existing.map((t) => t.topic));
    const missing = DEFAULT_TOPICS[track].filter((t) => !have.has(t));
    if (missing.length) {
      await prisma.topicProgress.createMany({ data: missing.map((topic) => ({ userId, track, topic })) });
    }
    const topics = await prisma.topicProgress.findMany({ where: { userId, track } });
    const orderIndex = new Map(DEFAULT_TOPICS[track].map((t, i) => [t, i]));
    topics.sort((a, b) => (orderIndex.get(a.topic) ?? 999) - (orderIndex.get(b.topic) ?? 999));
    res.json(topics);
  })
);

router.post(
  "/:track",
  asyncH(async (req, res) => {
    const track = req.params.track.toUpperCase() as "JAVA" | "DSA" | "APTITUDE";
    const { topic } = parseBody(z.object({ topic: z.string().min(1) }), req);
    const created = await prisma.topicProgress.create({ data: { userId: uid(req), track, topic } });
    res.status(201).json(created);
  })
);

router.patch(
  "/id/:id",
  asyncH(async (req, res) => {
    const data = parseBody(topicSchema, req);
    const userId = uid(req);
    await prisma.topicProgress.updateMany({ where: { id: req.params.id, userId }, data });
    const topic = await prisma.topicProgress.findFirst({ where: { id: req.params.id, userId } });
    res.json(topic);
  })
);

router.delete(
  "/id/:id",
  asyncH(async (req, res) => {
    await prisma.topicProgress.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
