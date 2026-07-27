import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface INote extends Document {
  user: Types.ObjectId;
  title: string;
  content: string; // TipTap HTML
  contentText: string; // plaintext for search + backlink parsing
  folder?: Types.ObjectId;
  tags: string[];
  category?: string;
  relatedProject?: Types.ObjectId;
  relatedTask?: Types.ObjectId;
  relatedCompany?: Types.ObjectId;
  links: Types.ObjectId[]; // notes referenced via [[Title]]
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  trashed: boolean;
  trashedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled", trim: true, maxlength: 300 },
    content: { type: String, default: "" },
    contentText: { type: String, default: "" },
    folder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    tags: { type: [String], default: [] },
    category: { type: String },
    relatedProject: { type: Schema.Types.ObjectId, ref: "Project" },
    relatedTask: { type: Schema.Types.ObjectId, ref: "Task" },
    relatedCompany: { type: Schema.Types.ObjectId, ref: "Company" },
    links: { type: [Schema.Types.ObjectId], ref: "Note", default: [] },
    pinned: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    trashed: { type: Boolean, default: false },
    trashedAt: { type: Date },
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, folder: 1 });
noteSchema.index({ user: 1, updatedAt: -1 });
noteSchema.index({ user: 1, title: "text", contentText: "text" });

export const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>("Note", noteSchema);
