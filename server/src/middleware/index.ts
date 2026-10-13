import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

export function securityMiddleware() {
  return [
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
    morgan("dev"),
  ];
}

export function createRateLimiter(max: number, windowMs: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
  });
}

export function sanitizeMongo(req: Request, res: Response, next: NextFunction) {
  void res;
  const blocked = ["$gt", "$ne", "$where", "$regex", "$exists"];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (blocked.includes(k) && typeof v !== "string") {
          throw new ApiError("Invalid query parameter.", 400);
        }
        walk(v);
      }
    }
  };
  try {
    walk(req.query);
    walk(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function errorMiddleware(
  err: Error & { status?: number; details?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status =
    err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  const payload: { success: boolean; error: string; details?: unknown } = {
    success: false,
    error: err.message || "Something went wrong.",
  };
  if (err.details) payload.details = err.details;
  if (env.NODE_ENV === "development" && status === 500) {
    (payload as any).stack = err.stack;
  }
  res.status(status).json(payload);
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: "Route not found." });
}