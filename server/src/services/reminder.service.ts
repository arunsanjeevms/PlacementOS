import dayjs from "dayjs";
import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { Session } from "../models/Session.js";
import { sendEmail } from "./email.service.js";
import { baseEmail, emailList } from "../utils/emailTemplates.js";
import { computeStreaks, todayKey } from "../utils/dates.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

const clientUrl = env.clientUrls[0] ?? "http://localhost:5173";

interface DigestUser {
  _id: unknown;
  name: string;
  email: string;
  preferences?: { email?: { morningDigest?: boolean; nightSummary?: boolean; missedStudy?: boolean } };
}

async function eligibleUsers(): Promise<DigestUser[]> {
  return User.find({ isEmailVerified: true }).select("name email preferences").lean() as unknown as Promise<DigestUser[]>;
}

/** Morning: today's tasks, goal, pending, streak, upcoming deadlines. */
export async function sendMorningDigests(): Promise<number> {
  const users = await eligibleUsers();
  let sent = 0;
  const start = dayjs().startOf("day").toDate();
  const end = dayjs().endOf("day").toDate();
  const in7 = dayjs().add(7, "day").endOf("day").toDate();

  for (const u of users) {
    if (u.preferences?.email?.morningDigest === false) continue;
    const uid = u._id;
    const [today, pending, upcoming, days] = await Promise.all([
      Task.find({ user: uid, date: { $gte: start, $lte: end }, status: { $ne: "done" } }).select("title priority").limit(15),
      Task.countDocuments({ user: uid, status: { $in: ["todo", "in_progress"] } }),
      Task.find({ user: uid, deadline: { $gte: start, $lte: in7 }, status: { $ne: "done" } }).sort({ deadline: 1 }).limit(8).select("title deadline"),
      Session.distinct("dateKey", { user: uid }),
    ]);
    const streak = computeStreaks(days as string[]);

    const html = baseEmail({
      title: "☀️ Your plan for today",
      greeting: `Good morning ${u.name.split(" ")[0]},`,
      body: `You're on a <b>${streak.current}-day streak</b>. Here's what to tackle today — you have <b>${pending}</b> open task${pending === 1 ? "" : "s"} in total.`,
      extraHtml: `
        <p style="margin:20px 0 6px;font-size:13px;font-weight:600;color:#c7c7d1;">Today's tasks</p>
        ${emailList(today.map((t) => t.title))}
        <p style="margin:20px 0 6px;font-size:13px;font-weight:600;color:#c7c7d1;">Upcoming deadlines</p>
        ${emailList(upcoming.map((t) => `${t.title} — <span style="color:#8b5cf6;">${dayjs(t.deadline).format("MMM D")}</span>`))}`,
      ctaLabel: "Open PlacementOS",
      ctaUrl: `${clientUrl}/app/today`,
      footnote: "You can turn off daily digests in Settings → Email preferences.",
    });
    await sendEmail({ to: u.email, subject: "☀️ Today's placement-prep plan", html });
    sent++;
  }
  logger.info(`Morning digests sent: ${sent}`);
  return sent;
}

/** Night: completed tasks, hours studied, missed tasks, tomorrow's plan. */
export async function sendNightSummaries(): Promise<number> {
  const users = await eligibleUsers();
  let sent = 0;
  const start = dayjs().startOf("day").toDate();
  const end = dayjs().endOf("day").toDate();
  const tStart = dayjs().add(1, "day").startOf("day").toDate();
  const tEnd = dayjs().add(1, "day").endOf("day").toDate();
  const key = todayKey();

  for (const u of users) {
    const emailPrefs = u.preferences?.email ?? {};
    if (emailPrefs.nightSummary === false && emailPrefs.missedStudy === false) continue;
    const uid = u._id;
    const [done, missed, tomorrow, minutesAgg] = await Promise.all([
      Task.find({ user: uid, status: "done", completedAt: { $gte: start, $lte: end } }).select("title").limit(20),
      Task.find({ user: uid, date: { $gte: start, $lte: end }, status: { $ne: "done" } }).select("title").limit(15),
      Task.find({ user: uid, date: { $gte: tStart, $lte: tEnd } }).select("title").limit(15),
      Session.aggregate<{ minutes: number }>([{ $match: { user: uid, dateKey: key } }, { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } }]),
    ]);
    const minutes = minutesAgg[0]?.minutes ?? 0;

    // Skip if nothing to say and night summary disabled but missedStudy on with study done.
    if (emailPrefs.nightSummary === false && minutes > 0) continue;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const studiedLabel = minutes > 0 ? `${hours ? `${hours}h ` : ""}${mins}m` : "nothing yet";

    const html = baseEmail({
      title: "🌙 Today's recap",
      greeting: `Evening ${u.name.split(" ")[0]},`,
      body: minutes > 0
        ? `You studied <b>${studiedLabel}</b> and completed <b>${done.length}</b> task${done.length === 1 ? "" : "s"} today. ${missed.length ? "A few things slipped — roll them into tomorrow." : "Clean sweep! 🎉"}`
        : `You haven't logged any study time today. Even 25 focused minutes keeps your streak alive. 💪`,
      extraHtml: `
        <p style="margin:20px 0 6px;font-size:13px;font-weight:600;color:#c7c7d1;">Completed</p>
        ${emailList(done.map((t) => t.title))}
        <p style="margin:20px 0 6px;font-size:13px;font-weight:600;color:#c7c7d1;">Missed today</p>
        ${emailList(missed.map((t) => t.title))}
        <p style="margin:20px 0 6px;font-size:13px;font-weight:600;color:#c7c7d1;">Tomorrow's plan</p>
        ${emailList(tomorrow.map((t) => t.title))}`,
      ctaLabel: "Plan tomorrow",
      ctaUrl: `${clientUrl}/app/today`,
      footnote: "Manage these emails in Settings → Email preferences.",
    });
    await sendEmail({ to: u.email, subject: "🌙 Your day in review", html });
    sent++;
  }
  logger.info(`Night summaries sent: ${sent}`);
  return sent;
}
