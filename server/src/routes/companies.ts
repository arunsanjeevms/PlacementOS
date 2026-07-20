import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { uid } from "../middleware/auth.js";
import { asyncH, parseBody, zDate } from "../lib/http.js";

const router = Router();

const companySchema = z.object({
  name: z.string().min(1),
  stage: z.enum(["WISHLIST", "PREPARING", "APPLIED", "ONLINE_ASSESSMENT", "INTERVIEW", "OFFER", "REJECTED"]).optional(),
  eligibility: z.string().optional(),
  ctc: z.string().optional(),
  oaPattern: z.string().optional(),
  rounds: z.array(z.object({ name: z.string(), status: z.string(), notes: z.string().optional() })).optional(),
  questions: z.array(z.object({ question: z.string(), topic: z.string().optional(), link: z.string().optional() })).optional(),
  resources: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
  preparation: z.number().int().min(0).max(100).optional(),
  resumeStatus: z.string().optional(),
  applied: z.boolean().optional(),
  interviewDate: zDate,
  notes: z.string().optional(),
  favorite: z.boolean().optional(),
});

router.get(
  "/",
  asyncH(async (req, res) => {
    const companies = await prisma.company.findMany({
      where: { userId: uid(req) },
      orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
    });
    res.json(companies);
  })
);

router.post(
  "/",
  asyncH(async (req, res) => {
    const data = parseBody(companySchema, req);
    const company = await prisma.company.create({ data: { ...data, userId: uid(req) } });
    res.status(201).json(company);
  })
);

router.patch(
  "/:id",
  asyncH(async (req, res) => {
    const data = parseBody(companySchema.partial(), req);
    const userId = uid(req);
    await prisma.company.updateMany({ where: { id: req.params.id, userId }, data });
    const company = await prisma.company.findFirst({ where: { id: req.params.id, userId } });
    res.json(company);
  })
);

router.delete(
  "/:id",
  asyncH(async (req, res) => {
    await prisma.company.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.json({ ok: true });
  })
);

export default router;
