import { Schema, model, type Document } from "mongoose";

export interface ITestimonial extends Document {
  quote: string;
  name: string;
  occasion: string;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    quote: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    occasion: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Testimonial = model<ITestimonial>("Testimonial", testimonialSchema);