import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer | undefined;

export async function startTestDb(): Promise<void> {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}

export async function stopTestDb(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongo?.stop();
  mongo = undefined;
}

export async function clearTestDb(): Promise<void> {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export function futureDate(days = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function pastDate(days = 3): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export const sampleProduct = {
  id: "wine-embroidered-sherwani",
  slug: "wine-embroidered-sherwani",
  name: "Wine Sherwani",
  category: "Wedding",
  subcategory: "Sherwani",
  price: 45900,
  description: "A wine-coloured long sherwani.",
  fabric: "Silk blend",
  fit: "Regular fit",
  occasion: ["Wedding", "Groom"],
  colors: [{ name: "Wine", hex: "#65343c" }],
  sizes: ["S", "M", "L", "XL", "XXL"],
  images: ["https://example.test/sherwani.jpg"],
  tags: ["Wedding", "Sherwani"],
  isNew: true,
  isBestseller: true,
  inStock: true,
  careInstructions: "Dry clean only.",
  deliveryNote: "Dispatched in 2-4 working days.",
  customTailoringAvailable: true,
};

export const validOrderPayload = {
  items: [
    {
      slug: "wine-embroidered-sherwani",
      name: "Wine Sherwani",
      price: 45900,
      quantity: 1,
      size: "L",
      color: "Wine",
    },
  ],
  customer: {
    name: "Aarav Mehta",
    email: "aarav@example.com",
    phone: "+91 9876543210",
  },
  address: {
    line1: "Masjid Fariya, Near Tower",
    city: "Vansda",
    state: "Gujarat",
    pincode: "388620",
  },
};
