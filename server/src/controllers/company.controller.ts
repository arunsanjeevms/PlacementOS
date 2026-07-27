import { Types, type FilterQuery } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { findOwnedOrThrow } from "../utils/query.js";
import { Company, type ICompany } from "../models/Company.js";

export const listCompanies = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const filter: FilterQuery<ICompany> = { user: req.user!.id };
  if (q.status) filter.status = q.status as string;
  if (q.search) filter.name = new RegExp(String(q.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const companies = await Company.find(filter).sort({ order: 1, createdAt: -1 });
  return sendSuccess(res, companies, "Companies");
});

export const getCompanySummary = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user!.id);
  const byStatus = await Company.aggregate<{ _id: string; count: number }>([
    { $match: { user: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const [totals] = await Company.aggregate<{ total: number; applied: number; avgProgress: number }>([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        applied: { $sum: { $cond: ["$applied", 1, 0] } },
        avgProgress: { $avg: "$preparationProgress" },
      },
    },
  ]);
  return sendSuccess(res, {
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    total: totals?.total ?? 0,
    applied: totals?.applied ?? 0,
    avgProgress: Math.round(totals?.avgProgress ?? 0),
  });
});

export const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create({ ...req.body, user: req.user!.id });
  return sendCreated(res, company, "Company added");
});

export const getCompany = asyncHandler(async (req, res) => {
  const company = await findOwnedOrThrow(Company, req.params.id, req.user!.id, "Company not found");
  return sendSuccess(res, company);
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOneAndUpdate({ _id: req.params.id, user: req.user!.id }, { $set: req.body }, { new: true });
  if (!company) throw ApiError.notFound("Company not found");
  return sendSuccess(res, company, "Company updated");
});

export const deleteCompany = asyncHandler(async (req, res) => {
  const deleted = await Company.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Company not found");
  return sendSuccess(res, { id: req.params.id }, "Company removed");
});

// ---- Rounds ----
export const addRound = asyncHandler(async (req, res) => {
  const company = await findOwnedOrThrow(Company, req.params.id, req.user!.id, "Company not found");
  company.rounds.push({ ...req.body, status: req.body.status ?? "pending" });
  await company.save();
  return sendCreated(res, company, "Round added");
});

export const updateRound = asyncHandler(async (req, res) => {
  const company = await findOwnedOrThrow(Company, req.params.id, req.user!.id, "Company not found");
  const round = company.rounds.id(req.params.roundId);
  if (!round) throw ApiError.notFound("Round not found");
  Object.assign(round, req.body);
  await company.save();
  return sendSuccess(res, company, "Round updated");
});

export const deleteRound = asyncHandler(async (req, res) => {
  const company = await findOwnedOrThrow(Company, req.params.id, req.user!.id, "Company not found");
  const round = company.rounds.id(req.params.roundId);
  if (!round) throw ApiError.notFound("Round not found");
  round.deleteOne();
  await company.save();
  return sendSuccess(res, company, "Round removed");
});
