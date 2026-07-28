import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { Topic } from "../models/Topic.js";
import { getTrackerSummary, seedKindForUser } from "../services/topic.service.js";
import type { TrackerKind } from "../constants/enums.js";

export const listTopics = asyncHandler(async (req, res) => {
  const kind = req.query.kind as TrackerKind;
  // Lazily seed defaults so accounts created before a tracker existed get its topics.
  await seedKindForUser(req.user!.id, kind);
  const topics = await Topic.find({ user: req.user!.id, kind }).sort({ order: 1, createdAt: 1 });
  return sendSuccess(res, topics, "Topics");
});

export const getTopicSummary = asyncHandler(async (req, res) => {
  const kind = req.query.kind as TrackerKind;
  const summary = await getTrackerSummary(req.user!.id, kind);
  return sendSuccess(res, summary);
});

export const createTopic = asyncHandler(async (req, res) => {
  const last = await Topic.findOne({ user: req.user!.id, kind: req.body.kind }).sort({ order: -1 }).select("order");
  const topic = await Topic.create({ ...req.body, order: (last?.order ?? -1) + 1, user: req.user!.id });
  return sendCreated(res, topic, "Topic added");
});

export const updateTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!topic) throw ApiError.notFound("Topic not found");
  return sendSuccess(res, topic, "Topic updated");
});

export const deleteTopic = asyncHandler(async (req, res) => {
  const deleted = await Topic.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Topic not found");
  return sendSuccess(res, { id: req.params.id }, "Topic deleted");
});

export const reorderTopics = asyncHandler(async (req, res) => {
  const items = req.body.items as { id: string; order: number }[];
  await Promise.all(items.map((it) => Topic.updateOne({ _id: it.id, user: req.user!.id }, { $set: { order: it.order } })));
  return sendSuccess(res, { updated: items.length }, "Reordered");
});
