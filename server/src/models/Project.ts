import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { PROJECT_STATUSES, type ProjectStatus } from "../constants/enums.js";

interface ChecklistItem {
  _id: Types.ObjectId;
  title: string;
  done: boolean;
  dueDate?: Date;
}
interface LinkItem {
  label: string;
  url: string;
}

export interface IProject extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  status: ProjectStatus;
  githubUrl?: string;
  liveUrl?: string;
  techStack: string[];
  milestones: Types.DocumentArray<ChecklistItem>;
  tasks: Types.DocumentArray<ChecklistItem>;
  deadline?: Date;
  screenshots: string[];
  notes?: string;
  resources: LinkItem[];
  order: number;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const checklistSchema = new Schema<ChecklistItem>({
  title: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
  dueDate: { type: Date },
});
const linkSchema = new Schema<LinkItem>({ label: { type: String, required: true }, url: { type: String, required: true } }, { _id: false });

const projectSchema = new Schema<IProject>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 5000 },
    status: { type: String, enum: PROJECT_STATUSES, default: "todo", index: true },
    githubUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
    techStack: { type: [String], default: [] },
    milestones: { type: [checklistSchema], default: [] },
    tasks: { type: [checklistSchema], default: [] },
    deadline: { type: Date },
    screenshots: { type: [String], default: [] },
    notes: { type: String, maxlength: 10000 },
    resources: { type: [linkSchema], default: [] },
    order: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ user: 1, status: 1, order: 1 });

export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
