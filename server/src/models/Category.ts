import { Schema, model, type Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  note: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    note: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Category = model<ICategory>("Category", categorySchema);