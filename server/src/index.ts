import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { requireAuth, uid } from "./middleware/auth.js";
import { asyncH } from "./lib/http.js";
import tasksRouter from "./routes/tasks.js";
import sessionsRouter from "./routes/sessions.js";
import projectsRouter from "./routes/projects.js";
import companiesRouter from "./routes/companies.js";
import resourcesRouter from "./routes/resources.js";
import notesRouter from "./routes/notes.js";
import topicsRouter from "./routes/topics.js";
import statsRouter from "./routes/stats.js";
import settingsRouter from "./routes/settings.js";
import searchRouter from "./routes/search.js";
import interviewRouter from "./routes/interview.js";
import cronRouter from "./routes/cron.js";
import dataRouter from "./routes/data.js";

const app = express();

app.use(cors({ origin: [env.clientUrl, "http://localhost:5173", "http://localhost:4173"], credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => res.json({ name: "PlacementOS API", status: "ok", demoMode: env.demoMode }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/cron", cronRouter);

app.use("/api", requireAuth);
app.get(
  "/api/me",
  asyncH(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: uid(req) }, include: { settings: true } });
    res.json({ ...user, demoMode: env.demoMode });
  })
);
app.use("/api/tasks", tasksRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/notes", notesRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/search", searchRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/data", dataRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`PlacementOS API listening on :${env.port}${env.demoMode ? " (demo mode — no Supabase secret configured)" : ""}`);
});
