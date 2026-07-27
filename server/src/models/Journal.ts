import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export const JOURNAL_TYPES = ["real", "mock"] as const;
export type JournalType = (typeof JOURNAL_TYPES)[number];

export const OUTCOMES = ["pending", "selected", "rejected", "next_round", "no_result"] as const;
export type Outcome = (typeof OUTCOMES)[number];

export interface IJournal extends Document {
  user: Types.ObjectId;
  type: JournalType;
  company: string;
  companyRef?: Types.ObjectId;
  role?: string;
  date: Date;
  round?: string;
  interviewer?: string;
  questionsAsked: string[];
  questionsMissed: string[];
  mistakes?: string;
  conceptsToRevise: string[];
  confidence: number; // 1–5
  outcome: Outcome;
  feedback?: string;
  nextAction?: string;
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new Schema<IJournal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: JOURNAL_TYPES, default: "real", index: true },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    companyRef: { type: Schema.Types.ObjectId, ref: "Company" },
    role: { type: String, trim: true },
    date: { type: Date, required: true },
    round: { type: String },
    interviewer: { type: String },
    questionsAsked: { type: [String], default: [] },
    questionsMissed: { type: [String], default: [] },
    mistakes: { type: String, maxlength: 5000 },
    conceptsToRevise: { type: [String], default: [] },
    confidence: { type: Number, min: 1, max: 5, default: 3 },
    outcome: { type: String, enum: OUTCOMES, default: "pending" },
    feedback: { type: String, maxlength: 5000 },
    nextAction: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

journalSchema.index({ user: 1, type: 1, date: -1 });

export const Journal: Model<IJournal> = mongoose.models.Journal || mongoose.model<IJournal>("Journal", journalSchema);
