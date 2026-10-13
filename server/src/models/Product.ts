import { Schema, model, type Document } from "mongoose";

export interface IProduct extends Document {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  fabric: string;
  fit: string;
  occasion: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  images: string[];
  imageAlt?: string;
  tags: string[];
  isNew: boolean;
  isBestseller: boolean;
  inStock: boolean;
  careInstructions: string;
  deliveryNote: string;
  customTailoringAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    id: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: String, required: true, index: true, trim: true },
    subcategory: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    description: { type: String, required: true, trim: true },
    fabric: { type: String, required: true, trim: true },
    fit: { type: String, required: true, trim: true },
    occasion: [{ type: String, required: true, trim: true }],
    colors: [
      {
        name: { type: String, required: true, trim: true },
        hex: { type: String, required: true, trim: true },
      },
    ],
    sizes: [{ type: String, required: true, trim: true }],
    images: [{ type: String, required: true }],
    imageAlt: { type: String, trim: true },
    tags: [{ type: String, required: true, trim: true }],
    isNew: { type: Boolean, default: false, index: true },
    isBestseller: { type: Boolean, default: false, index: true },
    inStock: { type: Boolean, default: true, index: true },
    careInstructions: { type: String, required: true, trim: true },
    deliveryNote: { type: String, required: true, trim: true },
    customTailoringAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isBestseller: -1, createdAt: -1 });
productSchema.index({ isNew: -1, createdAt: -1 });

export const Product = model<IProduct>("Product", productSchema);