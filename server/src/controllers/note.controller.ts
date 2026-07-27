import { Types, type FilterQuery } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { Note, type INote } from "../models/Note.js";
import { Folder } from "../models/Folder.js";

// ---------------- Folders ----------------
export const listFolders = asyncHandler(async (req, res) => {
  const folders = await Folder.find({ user: req.user!.id }).sort({ order: 1, name: 1 });
  return sendSuccess(res, folders, "Folders");
});

export const createFolder = asyncHandler(async (req, res) => {
  const folder = await Folder.create({ ...req.body, user: req.user!.id });
  return sendCreated(res, folder, "Folder created");
});

export const updateFolder = asyncHandler(async (req, res) => {
  const folder = await Folder.findOneAndUpdate({ _id: req.params.id, user: req.user!.id }, { $set: req.body }, { new: true });
  if (!folder) throw ApiError.notFound("Folder not found");
  return sendSuccess(res, folder, "Folder updated");
});

export const deleteFolder = asyncHandler(async (req, res) => {
  const folder = await Folder.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!folder) throw ApiError.notFound("Folder not found");
  // Detach notes and re-parent child folders to root.
  await Promise.all([
    Note.updateMany({ user: req.user!.id, folder: folder._id }, { $set: { folder: null } }),
    Folder.updateMany({ user: req.user!.id, parent: folder._id }, { $set: { parent: null } }),
  ]);
  return sendSuccess(res, { id: req.params.id }, "Folder deleted");
});

// ---------------- Notes ----------------
/** Resolve [[Title]] wiki-links in text to note ids owned by the user. */
async function parseLinks(userId: string, text: string, excludeId?: string): Promise<Types.ObjectId[]> {
  const matches = [...text.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1].trim()).filter(Boolean);
  if (matches.length === 0) return [];
  const titles = [...new Set(matches)];
  const notes = await Note.find({
    user: userId,
    trashed: false,
    title: { $in: titles.map((t) => new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select("_id");
  return notes.map((n) => n._id as Types.ObjectId);
}

export const listNotes = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const filter = (q.filter as string) ?? "all";
  const base: FilterQuery<INote> = { user: req.user!.id };

  if (filter === "trash") base.trashed = true;
  else {
    base.trashed = false;
    if (filter === "favorite") base.favorite = true;
    else if (filter === "pinned") base.pinned = true;
    else if (filter === "archived") base.archived = true;
    else base.archived = false; // "all"
  }

  if (q.folder === "none") base.folder = null;
  else if (q.folder) base.folder = new Types.ObjectId(q.folder as string);
  if (q.tag) base.tags = q.tag as string;
  if (q.search) {
    const rx = new RegExp(String(q.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    base.$or = [{ title: rx }, { contentText: rx }, { tags: rx }];
  }

  const notes = await Note.find(base)
    .sort({ pinned: -1, updatedAt: -1 })
    .limit(Number(q.limit ?? 200))
    .select("-content"); // list view uses excerpt only
  return sendSuccess(res, notes, "Notes");
});

export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user!.id });
  if (!note) throw ApiError.notFound("Note not found");
  return sendSuccess(res, note);
});

export const createNote = asyncHandler(async (req, res) => {
  const links = await parseLinks(req.user!.id, req.body.contentText ?? "");
  const note = await Note.create({ ...req.body, links, user: req.user!.id });
  return sendCreated(res, note, "Note created");
});

export const updateNote = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (typeof body.contentText === "string") {
    body.links = await parseLinks(req.user!.id, body.contentText, req.params.id);
  }
  if (body.trashed === true) body.trashedAt = new Date();
  if (body.trashed === false) body.trashedAt = null;

  const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user!.id }, { $set: body }, { new: true });
  if (!note) throw ApiError.notFound("Note not found");
  return sendSuccess(res, note, "Saved");
});

export const deleteNote = asyncHandler(async (req, res) => {
  // Permanent delete (used from trash).
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Note not found");
  await Note.updateMany({ user: req.user!.id, links: deleted._id }, { $pull: { links: deleted._id } });
  return sendSuccess(res, { id: req.params.id }, "Note deleted");
});

export const emptyTrash = asyncHandler(async (req, res) => {
  const result = await Note.deleteMany({ user: req.user!.id, trashed: true });
  return sendSuccess(res, { deleted: result.deletedCount }, "Trash emptied");
});

export const getBacklinks = asyncHandler(async (req, res) => {
  const backlinks = await Note.find({ user: req.user!.id, trashed: false, links: new Types.ObjectId(req.params.id) })
    .select("title updatedAt")
    .sort({ updatedAt: -1 });
  return sendSuccess(res, backlinks, "Backlinks");
});
