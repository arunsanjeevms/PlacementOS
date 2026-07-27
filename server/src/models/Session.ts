import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export const SESSION_MODES = ["25/5", "45/10", "60/10", "90/20", "custom", "manual"] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

export const MOODS = ["great", "good", "okay", "tired", "stressed"] as const;
export type Mood = (typeof MOODS)[number];

export interface ISession extends Document {
  user: Types.ObjectId;
  category: string;
  task?: Types.ObjectId;
  taskTitle?: string;
  durationMinutes: number;
  mode: SessionMode;
  productivity?: number; // 1–5
  mood?: Mood;
  notes?: string;
  startedAt: Date;
  endedAt: Date;
  /** Local day key (YYYY-MM-DD) for cheap per-day grouping in heatmap/stats. */
  dateKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, default: "DSA", trim: true },
    task: { type: Schema.Types.ObjectId, ref: "Task" },
    taskTitle: { type: String, trim: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },
    mode: { type: String, enum: SESSION_MODES, default: "25/5" },
    productivity: { type: Number, min: 1, max: 5 },
    mood: { type: String, enum: MOODS },
    notes: { type: String, maxlength: 2000 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    dateKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, dateKey: 1 });
sessionSchema.index({ user: 1, startedAt: -1 });
sessionSchema.index({ user: 1, category: 1 });

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);
