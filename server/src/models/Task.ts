import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import {
  DIFFICULTIES,
  PRIORITIES,
  REPEAT_RULES,
  TASK_SCOPES,
  TASK_STATUSES,
  type Difficulty,
  type Priority,
  type RepeatRule,
  type TaskScope,
  type TaskStatus,
} from "../constants/enums.js";

export interface Subtask {
  _id: Types.ObjectId;
  title: string;
  done: boolean;
}

export interface TaskLink {
  label: string;
  url: string;
}

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  priority: Priority;
  difficulty?: Difficulty;
  category: string;
  scope: TaskScope;
  status: TaskStatus;
  date?: Date;
  deadline?: Date;
  estimatedMinutes?: number;
  actualMinutes: number;
  tags: string[];
  links: TaskLink[];
  notes?: string;
  subtasks: Types.DocumentArray<Subtask>;
  repeat: RepeatRule;
  order: number;
  pinned: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<Subtask>({
  title: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
});

const linkSchema = new Schema<TaskLink>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, maxlength: 5000 },
    priority: { type: String, enum: PRIORITIES, default: "medium" },
    difficulty: { type: String, enum: DIFFICULTIES },
    category: { type: String, default: "Custom", trim: true },
    scope: { type: String, enum: TASK_SCOPES, default: "daily" },
    status: { type: String, enum: TASK_STATUSES, default: "todo", index: true },
    date: { type: Date },
    deadline: { type: Date },
    estimatedMinutes: { type: Number, min: 0 },
    actualMinutes: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    links: { type: [linkSchema], default: [] },
    notes: { type: String, maxlength: 10000 },
    subtasks: { type: [subtaskSchema], default: [] },
    repeat: { type: String, enum: REPEAT_RULES, default: "none" },
    order: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Common access patterns.
taskSchema.index({ user: 1, date: 1 });
taskSchema.index({ user: 1, scope: 1, status: 1 });
taskSchema.index({ user: 1, deadline: 1 });
taskSchema.index({ user: 1, category: 1 });

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);
