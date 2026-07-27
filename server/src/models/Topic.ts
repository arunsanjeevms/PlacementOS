import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { TRACKER_KINDS, type TrackerKind } from "../constants/enums.js";

export const TOPIC_STATUSES = ["not_started", "learning", "completed"] as const;
export type TopicStatus = (typeof TOPIC_STATUSES)[number];

interface Count {
  solved: number;
  total: number;
}
interface LinkItem {
  label: string;
  url: string;
}

export interface ITopic extends Document {
  user: Types.ObjectId;
  kind: TrackerKind;
  name: string;
  order: number;
  status: TopicStatus;

  // Java / generic
  completion: number; // 0–100
  practiceQuestions: number;

  // DSA
  easy: Count;
  medium: Count;
  hard: Count;

  // Aptitude
  solved: number;
  accuracy: number; // 0–100
  practiceMinutes: number;
  avgTimeSeconds: number;

  // Shared
  revisionCount: number;
  isWeak: boolean;
  notes?: string;
  bookmarks: LinkItem[];
  resources: LinkItem[];

  createdAt: Date;
  updatedAt: Date;
}

const countSchema = new Schema<Count>({ solved: { type: Number, default: 0, min: 0 }, total: { type: Number, default: 0, min: 0 } }, { _id: false });
const linkSchema = new Schema<LinkItem>({ label: { type: String, required: true }, url: { type: String, required: true } }, { _id: false });

const topicSchema = new Schema<ITopic>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: TRACKER_KINDS, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    order: { type: Number, default: 0 },
    status: { type: String, enum: TOPIC_STATUSES, default: "not_started" },

    completion: { type: Number, default: 0, min: 0, max: 100 },
    practiceQuestions: { type: Number, default: 0, min: 0 },

    easy: { type: countSchema, default: () => ({ solved: 0, total: 0 }) },
    medium: { type: countSchema, default: () => ({ solved: 0, total: 0 }) },
    hard: { type: countSchema, default: () => ({ solved: 0, total: 0 }) },

    solved: { type: Number, default: 0, min: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    practiceMinutes: { type: Number, default: 0, min: 0 },
    avgTimeSeconds: { type: Number, default: 0, min: 0 },

    revisionCount: { type: Number, default: 0, min: 0 },
    isWeak: { type: Boolean, default: false },
    notes: { type: String, maxlength: 10000 },
    bookmarks: { type: [linkSchema], default: [] },
    resources: { type: [linkSchema], default: [] },
  },
  { timestamps: true }
);

topicSchema.index({ user: 1, kind: 1, order: 1 });

export const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>("Topic", topicSchema);
