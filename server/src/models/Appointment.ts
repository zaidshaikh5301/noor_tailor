import { Schema, model, type Document } from "mongoose";

export interface IAppointment extends Document {
  garmentType: string;
  occasion: string;
  preferredDate: Date;
  contactMethod: "in-store" | "call";
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    garmentType: { type: String, required: true, trim: true },
    occasion: { type: String, required: true, trim: true },
    preferredDate: { type: Date, required: true },
    contactMethod: {
      type: String,
      enum: ["in-store", "call"],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ createdAt: -1 });

export const Appointment = model<IAppointment>("Appointment", appointmentSchema);