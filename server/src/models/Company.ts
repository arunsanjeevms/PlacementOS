import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { COMPANY_STATUSES, type CompanyStatus } from "../constants/enums.js";

interface Round {
  _id: Types.ObjectId;
  name: string;
  status: "pending" | "cleared" | "failed";
  date?: Date;
  notes?: string;
}
interface LinkItem {
  label: string;
  url: string;
}

export interface ICompany extends Document {
  user: Types.ObjectId;
  name: string;
  role?: string;
  ctc?: string;
  location?: string;
  eligibility?: string;
  status: CompanyStatus;
  applied: boolean;
  resumeSent: boolean;
  interviewDate?: Date;
  deadline?: Date;
  preparationProgress: number;
  rounds: Types.DocumentArray<Round>;
  oaPattern?: string;
  hrQuestions: string[];
  technicalQuestions: string[];
  notes?: string;
  resources: LinkItem[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const roundSchema = new Schema<Round>({
  name: { type: String, required: true, trim: true },
  status: { type: String, enum: ["pending", "cleared", "failed"], default: "pending" },
  date: { type: Date },
  notes: { type: String },
});
const linkSchema = new Schema<LinkItem>({ label: { type: String, required: true }, url: { type: String, required: true } }, { _id: false });

const companySchema = new Schema<ICompany>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, trim: true },
    ctc: { type: String, trim: true },
    location: { type: String, trim: true },
    eligibility: { type: String },
    status: { type: String, enum: COMPANY_STATUSES, default: "wishlist", index: true },
    applied: { type: Boolean, default: false },
    resumeSent: { type: Boolean, default: false },
    interviewDate: { type: Date },
    deadline: { type: Date },
    preparationProgress: { type: Number, min: 0, max: 100, default: 0 },
    rounds: { type: [roundSchema], default: [] },
    oaPattern: { type: String },
    hrQuestions: { type: [String], default: [] },
    technicalQuestions: { type: [String], default: [] },
    notes: { type: String, maxlength: 10000 },
    resources: { type: [linkSchema], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

companySchema.index({ user: 1, status: 1 });

export const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>("Company", companySchema);
