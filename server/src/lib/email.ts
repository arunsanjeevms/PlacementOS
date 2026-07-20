import { Resend } from "resend";
import { env } from "./env.js";
import { prisma } from "./prisma.js";
import { getStatsSummary, toDateKey, addDays } from "./stats.js";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

const fmtHours = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#0b0b12;font-family:'Segoe UI',Arial,sans-serif;padding:32px 16px">
  <div style="max-width:560px;margin:0 auto;background:#14141f;border:1px solid #262636;border-radius:16px;overflow:hidden">
    <div style="padding:24px 28px;border-bottom:1px solid #262636">
      <div style="font-size:13px;letter-spacing:2px;color:#8b8ba7;text-transform:uppercase">PlacementOS</div>
      <div style="font-size:22px;font-weight:700;color:#f4f4fa;margin-top:6px">${title}</div>
    </div>
    <div style="padding:24px 28px;color:#c9c9dd;font-size:14px;line-height:1.7">${body}</div>
    <div style="padding:16px 28px;border-top:1px solid #262636;color:#6b6b85;font-size:12px">
      Keep shipping. Your future self is watching. — <a href="${env.clientUrl}" style="color:#a78bfa">Open PlacementOS</a>
    </div>
  </div></body></html>`;
}

const stat = (label: string, value: string) =>
  `<td style="padding:12px;background:#1b1b2a;border-radius:10px;text-align:center">
    <div style="font-size:20px;font-weight:700;color:#a78bfa">${value}</div>
    <div style="font-size:11px;color:#8b8ba7;text-transform:uppercase;letter-spacing:1px;margin-top:2px">${label}</div>
  </td>`;

const taskList = (tasks: { title: string; category: string; priority: string }[], empty: string) =>
  tasks.length === 0
    ? `<div style="color:#6b6b85">${empty}</div>`
    : `<ul style="margin:8px 0;padding-left:18px">${tasks
        .map(
          (t) =>
            `<li style="margin:6px 0"><span style="color:#f4f4fa">${t.title}</span>
             <span style="color:#6b6b85;font-size:12px"> · ${t.category} · ${t.priority.toLowerCase()}</span></li>`
        )
        .join("")}</ul>`;

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[email:skipped] RESEND_API_KEY not set — would send "${subject}" to ${to}`);
    return false;
  }
  await resend.emails.send({ from: env.emailFrom, to, subject, html });
  return true;
}

export async function sendMorningBrief(userId: string, todayKey: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { settings: true } });
  if (!user?.settings?.morningEmail) return false;

  const [summary, todays, pending, deadlines] = await Promise.all([
    getStatsSummary(userId, todayKey),
    prisma.task.findMany({ where: { userId, scope: "DAILY", scheduledFor: todayKey, status: { not: "ARCHIVED" } }, orderBy: { order: "asc" } }),
    prisma.task.count({ where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } } }),
    prisma.task.findMany({
      where: { userId, status: { in: ["TODO", "IN_PROGRESS"] }, deadline: { lte: new Date(Date.now() + 3 * 86400000) } },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
  ]);

  const goalMin = Math.round((user.settings.dailyGoalHours ?? 6) * 60);
  const body = `
    <p>Good morning${user.name ? ", " + user.name : ""}! Here's your battle plan for today.</p>
    <table width="100%" cellspacing="8"><tr>
      ${stat("Streak", `${summary.streaks.current}🔥`)}
      ${stat("Goal", fmtHours(goalMin))}
      ${stat("This week", fmtHours(summary.weekMinutes))}
      ${stat("Pending", String(pending))}
    </tr></table>
    <h3 style="color:#f4f4fa;margin:20px 0 4px">Today's tasks (${todays.length})</h3>
    ${taskList(todays, "No tasks scheduled — open the app and plan your day.")}
    <h3 style="color:#f4f4fa;margin:20px 0 4px">Upcoming deadlines</h3>
    ${taskList(deadlines, "Nothing due in the next 3 days.")}`;

  const ok = await send(user.email, `☀️ Morning brief — ${todays.length} tasks, ${summary.streaks.current} day streak`, shell("Morning Brief", body));
  if (ok) await prisma.reminderLog.create({ data: { userId, type: "morning" } });
  return ok;
}

export async function sendNightSummary(userId: string, todayKey: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { settings: true } });
  if (!user?.settings?.nightEmail) return false;

  const tomorrow = addDays(todayKey, 1);
  const [summary, completed, missed, tomorrowTasks] = await Promise.all([
    getStatsSummary(userId, todayKey),
    prisma.task.findMany({ where: { userId, status: "DONE", completedDate: todayKey } }),
    prisma.task.findMany({ where: { userId, scope: "DAILY", scheduledFor: todayKey, status: { in: ["TODO", "IN_PROGRESS"] } } }),
    prisma.task.findMany({ where: { userId, scope: "DAILY", scheduledFor: tomorrow, status: { not: "ARCHIVED" } } }),
  ]);

  const body = `
    <p>Day wrapped${user.name ? ", " + user.name : ""}. Here's how it went.</p>
    <table width="100%" cellspacing="8"><tr>
      ${stat("Studied", fmtHours(summary.todayMinutes))}
      ${stat("Done", String(completed.length))}
      ${stat("Missed", String(missed.length))}
      ${stat("Streak", `${summary.streaks.current}🔥`)}
    </tr></table>
    <h3 style="color:#f4f4fa;margin:20px 0 4px">Completed today</h3>
    ${taskList(completed, "No tasks completed today.")}
    <h3 style="color:#f4f4fa;margin:20px 0 4px">Missed</h3>
    ${taskList(missed, "Nothing missed. Clean sheet. 👏")}
    <h3 style="color:#f4f4fa;margin:20px 0 4px">Tomorrow's plan</h3>
    ${taskList(tomorrowTasks, "Tomorrow is unplanned — schedule it tonight.")}`;

  const ok = await send(user.email, `🌙 Night summary — ${fmtHours(summary.todayMinutes)} studied, ${completed.length} done`, shell("Night Summary", body));
  if (ok) await prisma.reminderLog.create({ data: { userId, type: "night" } });
  return ok;
}

export async function sendInactivityNudge(userId: string, todayKey: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { settings: true } });
  if (!user?.settings?.inactivityEmail) return false;

  const summary = await getStatsSummary(userId, todayKey);
  if (summary.todayMinutes > 0 || summary.todayTasksDone > 0) return false;

  const body = `
    <p>No study activity detected today. Your <b style="color:#a78bfa">${summary.streaks.current} day streak</b> is on the line.</p>
    <p>Even 25 minutes keeps the chain alive. Start one pomodoro now.</p>`;
  const ok = await send(user.email, `⚠️ Your ${summary.streaks.current} day streak is at risk`, shell("Streak Alert", body));
  if (ok) await prisma.reminderLog.create({ data: { userId, type: "inactivity" } });
  return ok;
}

export function todayKeyForTz(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
    return parts.format(new Date());
  } catch {
    return toDateKey(new Date());
  }
}
