import { Types, type FilterQuery } from "mongoose";
import dayjs from "dayjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { buildSort, findOwnedOrThrow, paginate } from "../utils/query.js";
import { Task, type ITask } from "../models/Task.js";
import type { RepeatRule } from "../constants/enums.js";

/** Build a Mongoose filter from the validated list query. */
function buildFilter(userId: string, q: Record<string, unknown>): FilterQuery<ITask> {
  const filter: FilterQuery<ITask> = { user: userId };
  if (q.status) filter.status = q.status as string;
  if (q.scope) filter.scope = q.scope as string;
  if (q.category) filter.category = q.category as string;
  if (q.priority) filter.priority = q.priority as string;
  if (q.tag) filter.tags = q.tag as string;
  if (typeof q.pinned === "boolean") filter.pinned = q.pinned;
  if (q.search) filter.title = { $regex: String(q.search), $options: "i" };
  if (q.from || q.to) {
    filter.date = {};
    if (q.from) (filter.date as Record<string, Date>).$gte = dayjs(q.from as Date).startOf("day").toDate();
    if (q.to) (filter.date as Record<string, Date>).$lte = dayjs(q.to as Date).endOf("day").toDate();
  }
  if (q.dueFrom || q.dueTo) {
    filter.deadline = {};
    if (q.dueFrom) (filter.deadline as Record<string, Date>).$gte = dayjs(q.dueFrom as Date).startOf("day").toDate();
    if (q.dueTo) (filter.deadline as Record<string, Date>).$lte = dayjs(q.dueTo as Date).endOf("day").toDate();
  }
  return filter;
}

export const listTasks = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const filter = buildFilter(req.user!.id, q);
  const sort = buildSort(q.sort as string | undefined, (q.order as "asc" | "desc") ?? "desc");
  const { items, meta } = await paginate(Task, filter, {
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 200),
    sort,
  });
  return sendSuccess(res, items, "Tasks", 200, meta);
});

export const getTaskSummary = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const startToday = dayjs().startOf("day").toDate();
  const endToday = dayjs().endOf("day").toDate();
  const in7 = dayjs().add(7, "day").endOf("day").toDate();

  const [byStatus, todayTotal, todayDone, overdue, upcoming] = await Promise.all([
    Task.aggregate<{ _id: string; count: number }>([
      { $match: { user: new Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ user: userId, date: { $gte: startToday, $lte: endToday } }),
    Task.countDocuments({ user: userId, date: { $gte: startToday, $lte: endToday }, status: "done" }),
    Task.countDocuments({ user: userId, deadline: { $lt: startToday }, status: { $ne: "done" } }),
    Task.countDocuments({ user: userId, deadline: { $gte: startToday, $lte: in7 }, status: { $ne: "done" } }),
  ]);

  const statusCounts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  return sendSuccess(res, {
    statusCounts,
    todayTotal,
    todayDone,
    overdue,
    upcoming,
  });
});

export const createTask = asyncHandler(async (req, res) => {
  // Place new tasks at the top of their column.
  const minOrder = await Task.findOne({ user: req.user!.id, status: req.body.status ?? "todo" })
    .sort({ order: 1 })
    .select("order");
  const order = req.body.order ?? (minOrder ? minOrder.order - 1 : 0);
  const task = await Task.create({ ...req.body, order, user: req.user!.id });
  return sendCreated(res, task, "Task created");
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await findOwnedOrThrow(Task, req.params.id, req.user!.id, "Task not found");
  return sendSuccess(res, task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnedOrThrow(Task, req.params.id, req.user!.id, "Task not found");
  const wasDone = task.status === "done";
  Object.assign(task, req.body);

  // Manage completedAt when status transitions to/from done.
  if (req.body.status === "done" && !wasDone) task.completedAt = new Date();
  if (req.body.status && req.body.status !== "done") task.completedAt = undefined;

  await task.save();
  return sendSuccess(res, task, "Task updated");
});

/** Toggles a task's completion. Recurring tasks spawn their next occurrence. */
export const toggleTask = asyncHandler(async (req, res) => {
  const task = await findOwnedOrThrow(Task, req.params.id, req.user!.id, "Task not found");
  const nowDone = task.status !== "done";
  task.status = nowDone ? "done" : "todo";
  task.completedAt = nowDone ? new Date() : undefined;
  await task.save();

  let next: ITask | null = null;
  if (nowDone && task.repeat !== "none") {
    next = await spawnRecurrence(task);
  }
  return sendSuccess(res, { task, next }, "Task updated");
});

async function spawnRecurrence(task: ITask): Promise<ITask | null> {
  const unit: Record<Exclude<RepeatRule, "none">, dayjs.ManipulateType> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
  };
  const step = unit[task.repeat as Exclude<RepeatRule, "none">];
  const base = task.date ?? new Date();
  const nextDate = dayjs(base).add(1, step).toDate();
  const nextDeadline = task.deadline ? dayjs(task.deadline).add(1, step).toDate() : undefined;

  return Task.create({
    user: task.user,
    title: task.title,
    description: task.description,
    priority: task.priority,
    difficulty: task.difficulty,
    category: task.category,
    scope: task.scope,
    status: "todo",
    date: nextDate,
    deadline: nextDeadline,
    estimatedMinutes: task.estimatedMinutes,
    tags: task.tags,
    links: task.links,
    notes: task.notes,
    subtasks: task.subtasks.map((s) => ({ title: s.title, done: false })),
    repeat: task.repeat,
    order: task.order,
  });
}

export const deleteTask = asyncHandler(async (req, res) => {
  const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
  if (!deleted) throw ApiError.notFound("Task not found");
  return sendSuccess(res, { id: req.params.id }, "Task deleted");
});

/** Bulk reorder + optional status move (for kanban drag & drop). */
export const reorderTasks = asyncHandler(async (req, res) => {
  const items = req.body.items as { id: string; order: number; status?: string }[];
  await Promise.all(
    items.map((it) =>
      Task.updateOne(
        { _id: it.id, user: req.user!.id },
        { $set: { order: it.order, ...(it.status ? { status: it.status } : {}) } }
      )
    )
  );
  return sendSuccess(res, { updated: items.length }, "Reordered");
});

// ---- Subtasks ----
export const addSubtask = asyncHandler(async (req, res) => {
  const task = await findOwnedOrThrow(Task, req.params.id, req.user!.id, "Task not found");
  task.subtasks.push({ title: req.body.title, done: false });
  await task.save();
  return sendCreated(res, task, "Subtask added");
});

export const toggleSubtask = asyncHandler(async (req, res) => {
  const task = await findOwnedOrThrow(Task, req.params.id, req.user!.id, "Task not found");
  const sub = task.subtasks.id(req.params.subId);
  if (!sub) throw ApiError.notFound("Subtask not found");
  sub.done = !sub.done;
  await task.save();
  return sendSuccess(res, task, "Subtask updated");
});

export const deleteSubtask = asyncHandler(async (req, res) => {
  const task = await findOwnedOrThrow(Task, req.params.id, req.user!.id, "Task not found");
  const sub = task.subtasks.id(req.params.subId);
  if (!sub) throw ApiError.notFound("Subtask not found");
  sub.deleteOne();
  await task.save();
  return sendSuccess(res, task, "Subtask removed");
});
