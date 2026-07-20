import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireCronSecret } from "../middleware/auth.js";
import { asyncH } from "../lib/http.js";
import { sendMorningBrief, sendNightSummary, sendInactivityNudge, todayKeyForTz } from "../lib/email.js";

const router = Router();
router.use(requireCronSecret);

async function forAllUsers(fn: (userId: string, todayKey: string) => Promise<boolean>) {
  const users = await prisma.user.findMany({ include: { settings: true } });
  let sent = 0;
  for (const user of users) {
    const todayKey = todayKeyForTz(user.settings?.timezone ?? "Asia/Kolkata");
    try {
      if (await fn(user.id, todayKey)) sent += 1;
    } catch (err) {
      console.error(`cron: failed for user ${user.id}`, err);
    }
  }
  return sent;
}

router.post(
  "/morning",
  asyncH(async (_req, res) => {
    const sent = await forAllUsers(sendMorningBrief);
    res.json({ ok: true, sent });
  })
);

router.post(
  "/night",
  asyncH(async (_req, res) => {
    const sent = await forAllUsers(sendNightSummary);
    res.json({ ok: true, sent });
  })
);

router.post(
  "/inactivity",
  asyncH(async (_req, res) => {
    const sent = await forAllUsers(sendInactivityNudge);
    res.json({ ok: true, sent });
  })
);

export default router;
