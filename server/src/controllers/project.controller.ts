import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { findOwnedOrThrow } from "../utils/query.js";
import { Project } from "../models/Project.js";

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user!.id }).sort({ order: 1, createdAt: -1 });
  return sendSuccess(res, projects, "Projects");
});

export const createProject = asyncHandler(async (req, res) => {
  const min = await Project.findOne({ user: req.user!.id, status: req.body.status ?? "todo" }).sort({ order: 1 }).select("order");
  const project = await Project.create({ ...req.body, order: min ? min.order - 1 : 0, user: req.user!.id });
  return sendCreated(res, project, "Project created");
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await findOwnedOrThrow(Project, req.params.id, req.user!.id, "Project not found");
  return sendSuccess(res, project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!project) throw ApiError.notFound("Project not found");
  return sendSuccess(res, project, "Project updated");
});

export const deleteProject = asyncHandler(async (req, res) => {
  const deleted = await Project.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Project not found");
  return sendSuccess(res, { id: req.params.id }, "Project deleted");
});

export const reorderProjects = asyncHandler(async (req, res) => {
  const items = req.body.items as { id: string; order: number; status?: string }[];
  await Promise.all(
    items.map((it) =>
      Project.updateOne({ _id: it.id, user: req.user!.id }, { $set: { order: it.order, ...(it.status ? { status: it.status } : {}) } })
    )
  );
  return sendSuccess(res, { updated: items.length }, "Reordered");
});

// ---- Milestones & tasks (both are checklist arrays) ----
type ChecklistField = "milestones" | "tasks";

function checklistOps(field: ChecklistField) {
  const add = asyncHandler(async (req, res) => {
    const project = await findOwnedOrThrow(Project, req.params.id, req.user!.id, "Project not found");
    project[field].push({ title: req.body.title, done: false, dueDate: req.body.dueDate });
    await project.save();
    return sendCreated(res, project, "Added");
  });
  const toggle = asyncHandler(async (req, res) => {
    const project = await findOwnedOrThrow(Project, req.params.id, req.user!.id, "Project not found");
    const item = project[field].id(req.params.itemId);
    if (!item) throw ApiError.notFound("Item not found");
    item.done = !item.done;
    await project.save();
    return sendSuccess(res, project, "Updated");
  });
  const remove = asyncHandler(async (req, res) => {
    const project = await findOwnedOrThrow(Project, req.params.id, req.user!.id, "Project not found");
    const item = project[field].id(req.params.itemId);
    if (!item) throw ApiError.notFound("Item not found");
    item.deleteOne();
    await project.save();
    return sendSuccess(res, project, "Removed");
  });
  return { add, toggle, remove };
}

export const milestoneOps = checklistOps("milestones");
export const taskOps = checklistOps("tasks");
