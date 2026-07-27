import { Types, type FilterQuery } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { buildSort, paginate } from "../utils/query.js";
import { Resource, type IResource } from "../models/Resource.js";

function buildFilter(userId: string, q: Record<string, unknown>): FilterQuery<IResource> {
  const filter: FilterQuery<IResource> = { user: userId };
  if (q.type) filter.type = q.type as string;
  if (q.category) filter.category = q.category as string;
  if (q.subject) filter.subject = q.subject as string;
  if (q.difficulty) filter.difficulty = q.difficulty as string;
  if (q.tag) filter.tags = q.tag as string;
  if (q.folder) filter.folder = q.folder as string;
  if (typeof q.favorite === "boolean") filter.favorite = q.favorite;
  if (typeof q.pinned === "boolean") filter.pinned = q.pinned;
  if (typeof q.completed === "boolean") filter.completed = q.completed;
  if (q.search) {
    const rx = new RegExp(String(q.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { description: rx }, { tags: rx }, { url: rx }];
  }
  return filter;
}

export const listResources = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const filter = buildFilter(req.user!.id, q);
  const sort = buildSort((q.sort as string) ?? "createdAt", (q.order as "asc" | "desc") ?? "desc");
  const { items, meta } = await paginate(Resource, filter, {
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 100),
    sort: { pinned: -1, ...sort },
  });
  return sendSuccess(res, items, "Resources", 200, meta);
});

export const getResourceSummary = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user!.id);
  const [byType, totals, folders] = await Promise.all([
    Resource.aggregate<{ _id: string; count: number }>([
      { $match: { user: userId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    Resource.aggregate<{ total: number; completed: number; favorites: number }>([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$completed", 1, 0] } },
          favorites: { $sum: { $cond: ["$favorite", 1, 0] } },
        },
      },
    ]),
    Resource.distinct("folder", { user: userId }),
  ]);
  return sendSuccess(res, {
    byType: Object.fromEntries(byType.map((t) => [t._id, t.count])),
    total: totals[0]?.total ?? 0,
    completed: totals[0]?.completed ?? 0,
    favorites: totals[0]?.favorites ?? 0,
    folders: (folders as (string | null)[]).filter(Boolean),
  });
});

export const createResource = asyncHandler(async (req, res) => {
  const resource = await Resource.create({ ...req.body, user: req.user!.id });
  return sendCreated(res, resource, "Resource saved");
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findOneAndUpdate({ _id: req.params.id, user: req.user!.id }, { $set: req.body }, { new: true });
  if (!resource) throw ApiError.notFound("Resource not found");
  return sendSuccess(res, resource, "Resource updated");
});

export const deleteResource = asyncHandler(async (req, res) => {
  const deleted = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Resource not found");
  return sendSuccess(res, { id: req.params.id }, "Resource deleted");
});

export const bulkResources = asyncHandler(async (req, res) => {
  const { ids, action, folder } = req.body as { ids: string[]; action: string; folder?: string };
  const match = { _id: { $in: ids }, user: req.user!.id };
  const actions: Record<string, () => Promise<unknown>> = {
    delete: () => Resource.deleteMany(match),
    favorite: () => Resource.updateMany(match, { $set: { favorite: true } }),
    unfavorite: () => Resource.updateMany(match, { $set: { favorite: false } }),
    complete: () => Resource.updateMany(match, { $set: { completed: true } }),
    uncomplete: () => Resource.updateMany(match, { $set: { completed: false } }),
    pin: () => Resource.updateMany(match, { $set: { pinned: true } }),
    unpin: () => Resource.updateMany(match, { $set: { pinned: false } }),
    move: () => Resource.updateMany(match, { $set: { folder: folder ?? "" } }),
  };
  const run = actions[action];
  if (!run) throw ApiError.badRequest("Unknown bulk action");
  await run();
  return sendSuccess(res, { affected: ids.length, action }, "Done");
});

export const importResources = asyncHandler(async (req, res) => {
  const docs = (req.body.resources as Record<string, unknown>[]).map((r) => ({ ...r, user: req.user!.id }));
  const inserted = await Resource.insertMany(docs, { ordered: false });
  return sendCreated(res, { imported: inserted.length }, `Imported ${inserted.length} resources`);
});

export const exportResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ user: req.user!.id }).sort({ createdAt: -1 }).lean();
  return sendSuccess(res, resources, "Export");
});
