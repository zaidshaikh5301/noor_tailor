import { Schema, model, type Document } from "mongoose";

export interface IOrderItem {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface IAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ICustomer {
  name: string;
  email: string;
  phone: string;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  customer: ICustomer;
  address: IAddress;
  couponCode?: string;
  discount: number;
  subtotal: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const addressSchema = new Schema<IAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    items: { type: [orderItemSchema], required: true, validate: (v: IOrderItem[]) => v.length > 0 },
    customer: { type: customerSchema, required: true },
    address: { type: addressSchema, required: true },
    couponCode: { type: String, trim: true },
    discount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ "customer.email": 1 });

export const Order = model<IOrder>("Order", orderSchema);