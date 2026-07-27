import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { DIFFICULTIES, RESOURCE_TYPES, type Difficulty, type ResourceType } from "../constants/enums.js";

export interface IResource extends Document {
  user: Types.ObjectId;
  title: string;
  url: string;
  description?: string;
  type: ResourceType;
  category?: string;
  subject?: string;
  difficulty?: Difficulty;
  tags: string[];
  notes?: string;
  folder?: string;
  previewImage?: string;
  rating: number;
  pinned: boolean;
  favorite: boolean;
  completed: boolean;
  relatedTask?: Types.ObjectId;
  relatedTopic?: Types.ObjectId;
  relatedCompany?: Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    url: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 2000 },
    type: { type: String, enum: RESOURCE_TYPES, default: "website", index: true },
    category: { type: String, trim: true },
    subject: { type: String, trim: true },
    difficulty: { type: String, enum: DIFFICULTIES },
    tags: { type: [String], default: [] },
    notes: { type: String, maxlength: 5000 },
    folder: { type: String, trim: true },
    previewImage: { type: String },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    pinned: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    relatedTask: { type: Schema.Types.ObjectId, ref: "Task" },
    relatedTopic: { type: Schema.Types.ObjectId, ref: "Topic" },
    relatedCompany: { type: Schema.Types.ObjectId, ref: "Company" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ user: 1, type: 1 });
resourceSchema.index({ user: 1, folder: 1 });
resourceSchema.index({ user: 1, favorite: 1 });
resourceSchema.index({ user: 1, createdAt: -1 });

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", resourceSchema);
