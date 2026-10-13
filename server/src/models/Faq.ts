import { Schema, model, type Document } from "mongoose";

export interface IFaq extends Document {
  q: string;
  a: string;
}

const faqSchema = new Schema<IFaq>(
  {
    q: { type: String, required: true, trim: true },
    a: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Faq = model<IFaq>("Faq", faqSchema);