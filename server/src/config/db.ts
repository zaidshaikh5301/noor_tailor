import mongoose from "mongoose";
import { env } from "../config/env.js";

let cached: typeof mongoose | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  if (cached) return cached;
  try {
    cached = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    return cached;
  } catch (err) {
    cached = null;
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  if (cached) {
    await cached.disconnect();
    cached = null;
  }
}

export function connectionStatus(): "connected" | "disconnected" | "connecting" {
  return mongoose.connection.readyState as
    | "connected"
    | "disconnected"
    | "connecting";
}