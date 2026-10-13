import { Schema, model, type Document } from "mongoose";

export interface IStoreInfo extends Document {
  name: string;
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
}

const storeInfoSchema = new Schema<IStoreInfo>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    hours: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const StoreInfo = model<IStoreInfo>("StoreInfo", storeInfoSchema);