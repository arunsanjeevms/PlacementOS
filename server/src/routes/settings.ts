import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody } from "../lib/http.js";

const router = Router();

const settingsSchema = z.object({
  theme: z.string().optional(),
  accentColor: z.string().optional(),
  timezone: z.string().optional(),
  dailyGoalHours: z.number().min(0).max(24).optional(),
  focusMinutes: z.number().int().min(1).max(240).optional(),
  shortBreakMinutes: z.number().int().min(1).max(60).optional(),
  longBreakMinutes: z.number().int().min(1).max(120).optional(),
  longBreakEvery: z.number().int().min(1).max(12).optional(),
  autoStartBreaks: z.boolean().optional(),
  autoStartPomodoros: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  morningEmail: z.boolean().optional(),
  nightEmail: z.boolean().optional(),
  inactivityEmail: z.boolean().optional(),
  emailFrequency: z.string().optional(),
  targetRole: z.string().optional(),
});

router.get(
  "/",
  asyncH(async (req, res) => {
    const userId = uid(req);
    let settings = await prisma.settings.findUnique({ where: { userId } });
    if (!settings) settings = await prisma.settings.create({ data: { userId } });
    res.json(settings);
  })
);

router.patch(
  "/",
  asyncH(async (req, res) => {
    const data = parseBody(settingsSchema, req);
    const userId = uid(req);
    const settings = await prisma.settings.upsert({ where: { userId }, create: { userId, ...data }, update: data });
    res.json(settings);
  })
);

export default router;
