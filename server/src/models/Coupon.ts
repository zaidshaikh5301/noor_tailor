import { Schema, model, type Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    active: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

export const Coupon = model<ICoupon>("Coupon", couponSchema);