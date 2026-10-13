import { Schema, model, type Document } from "mongoose";

export interface ICollection extends Document {
  name: string;
  eyebrow: string;
  copy: string;
  link: string;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    eyebrow: { type: String, required: true, trim: true },
    copy: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Collection = model<ICollection>("Collection", collectionSchema);