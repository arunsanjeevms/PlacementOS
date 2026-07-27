import { type FilterQuery } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { Journal, type IJournal } from "../models/Journal.js";

export const listJournals = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const filter: FilterQuery<IJournal> = { user: req.user!.id };
  if (q.type) filter.type = q.type as string;
  if (q.outcome) filter.outcome = q.outcome as string;
  if (q.search) {
    const rx = new RegExp(String(q.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ company: rx }, { role: rx }, { round: rx }];
  }
  const entries = await Journal.find(filter).sort({ date: -1, createdAt: -1 });
  return sendSuccess(res, entries, "Journal");
});

export const createJournal = asyncHandler(async (req, res) => {
  const entry = await Journal.create({ ...req.body, user: req.user!.id });
  return sendCreated(res, entry, "Entry saved");
});

export const updateJournal = asyncHandler(async (req, res) => {
  const entry = await Journal.findOneAndUpdate({ _id: req.params.id, user: req.user!.id }, { $set: req.body }, { new: true });
  if (!entry) throw ApiError.notFound("Entry not found");
  return sendSuccess(res, entry, "Entry updated");
});

export const deleteJournal = asyncHandler(async (req, res) => {
  const deleted = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Entry not found");
  return sendSuccess(res, { id: req.params.id }, "Entry deleted");
});
