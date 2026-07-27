import { z } from "zod";
import { COMPANY_STATUSES } from "../constants/enums.js";

const link = z.object({ label: z.string().trim().min(1).max(120), url: z.string().trim().url() });

export const createCompanySchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().max(120).optional(),
  ctc: z.string().max(60).optional(),
  location: z.string().max(120).optional(),
  eligibility: z.string().max(1000).optional(),
  status: z.enum(COMPANY_STATUSES).default("wishlist"),
  applied: z.boolean().optional(),
  resumeSent: z.boolean().optional(),
  interviewDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  preparationProgress: z.coerce.number().min(0).max(100).optional(),
  oaPattern: z.string().max(2000).optional(),
  hrQuestions: z.array(z.string().max(500)).max(200).optional(),
  technicalQuestions: z.array(z.string().max(500)).max(200).optional(),
  notes: z.string().max(10000).optional(),
  resources: z.array(link).max(50).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const roundSchema = z.object({
  name: z.string().trim().min(1).max(120),
  status: z.enum(["pending", "cleared", "failed"]).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});
export const updateRoundSchema = roundSchema.partial();

export const listCompanyQuerySchema = z.object({
  status: z.enum(COMPANY_STATUSES).optional(),
  search: z.string().trim().optional(),
});
