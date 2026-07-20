import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH } from "../lib/http.js";

const router = Router();

const EXPORT_MODELS = [
  "task",
  "subtask",
  "studySession",
  "project",
  "milestone",
  "company",
  "resource",
  "note",
  "folder",
  "bookmark",
  "topicProgress",
  "dayLog",
  "interviewQuestion",
  "mockInterview",
  "achievement",
] as const;

router.get(
  "/export",
  asyncH(async (req, res) => {
    const userId = uid(req);
    const dump: Record<string, unknown> = { exportedAt: new Date().toISOString(), version: 1 };
    for (const model of EXPORT_MODELS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dump[model] = await (prisma as any)[model].findMany({ where: { userId } });
    }
    dump.settings = await prisma.settings.findUnique({ where: { userId } });
    res.setHeader("Content-Disposition", `attachment; filename=placementos-backup-${Date.now()}.json`);
    res.json(dump);
  })
);

router.post(
  "/import",
  asyncH(async (req, res) => {
    const userId = uid(req);
    const dump = req.body as Record<string, unknown[]>;
    let imported = 0;

    const strip = (row: Record<string, unknown>) => {
      const { id: _id, userId: _u, taskId: _t, projectId: _p, noteId: _n, folderId: _f, ...rest } = row;
      return rest;
    };

    // Only import flat, self-contained models to keep referential integrity simple.
    for (const model of ["studySession", "resource", "topicProgress", "dayLog", "interviewQuestion", "mockInterview"] as const) {
      const rows = dump[model];
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (prisma as any)[model].create({ data: { ...strip(row as Record<string, unknown>), userId } });
          imported += 1;
        } catch {
          // skip duplicates/invalid rows
        }
      }
    }
    for (const row of (dump.task as Record<string, unknown>[]) ?? []) {
      try {
        const { subtasks: _s, attachments: _a, ...rest } = strip(row);
        await prisma.task.create({ data: { ...rest, userId } as never });
        imported += 1;
      } catch {
        /* skip */
      }
    }
    res.json({ ok: true, imported });
  })
);

export default router;
