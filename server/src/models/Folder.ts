import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IFolder extends Document {
  user: Types.ObjectId;
  name: string;
  parent?: Types.ObjectId;
  color?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    parent: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    color: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

folderSchema.index({ user: 1, parent: 1, order: 1 });

export const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>("Folder", folderSchema);
