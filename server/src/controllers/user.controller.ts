import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { User, defaultPreferences } from "../models/User.js";
import { Task } from "../models/Task.js";
import { Session } from "../models/Session.js";
import { Topic } from "../models/Topic.js";
import { Project } from "../models/Project.js";
import { Note } from "../models/Note.js";
import { Folder } from "../models/Folder.js";
import { Resource } from "../models/Resource.js";
import { Company } from "../models/Company.js";
import { Journal } from "../models/Journal.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user!.id, { $set: req.body }, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound("User not found");
  return sendSuccess(res, { user: user.toJSON() }, "Profile updated");
});

/** Deep-merge preferences so nested pomodoro/email objects keep untouched keys. */
export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");
  const current = { ...defaultPreferences, ...(user.preferences ?? {}) };
  const incoming = req.body as Record<string, unknown>;
  user.preferences = {
    ...current,
    ...incoming,
    pomodoro: { ...current.pomodoro, ...((incoming.pomodoro as object) ?? {}) },
    email: { ...current.email, ...((incoming.email as object) ?? {}) },
  };
  user.markModified("preferences");
  await user.save();
  return sendSuccess(res, { user: user.toJSON() }, "Preferences saved");
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id).select("+password +refreshTokens");
  if (!user) throw ApiError.notFound("User not found");
  const ok = await user.comparePassword(req.body.currentPassword);
  if (!ok) throw ApiError.badRequest("Current password is incorrect");
  user.password = req.body.newPassword;
  user.refreshTokens = []; // force re-login on other devices
  await user.save();
  return sendSuccess(res, null, "Password changed");
});

/** Full JSON backup of everything the user owns. */
export const exportData = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const [user, tasks, sessions, topics, projects, notes, folders, resources, companies, journal] = await Promise.all([
    User.findById(userId),
    Task.find({ user: userId }).lean(),
    Session.find({ user: userId }).lean(),
    Topic.find({ user: userId }).lean(),
    Project.find({ user: userId }).lean(),
    Note.find({ user: userId }).lean(),
    Folder.find({ user: userId }).lean(),
    Resource.find({ user: userId }).lean(),
    Company.find({ user: userId }).lean(),
    Journal.find({ user: userId }).lean(),
  ]);
  return sendSuccess(res, {
    exportedAt: new Date().toISOString(),
    version: 1,
    profile: user?.toJSON(),
    tasks,
    sessions,
    topics,
    projects,
    notes,
    folders,
    resources,
    companies,
    journal,
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  await Promise.all([
    Task.deleteMany({ user: userId }),
    Session.deleteMany({ user: userId }),
    Topic.deleteMany({ user: userId }),
    Project.deleteMany({ user: userId }),
    Note.deleteMany({ user: userId }),
    Folder.deleteMany({ user: userId }),
    Resource.deleteMany({ user: userId }),
    Company.deleteMany({ user: userId }),
    Journal.deleteMany({ user: userId }),
  ]);
  await User.findByIdAndDelete(userId);
  return sendSuccess(res, null, "Account deleted");
});
