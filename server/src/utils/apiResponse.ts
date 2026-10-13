import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
): void {
  res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  details?: unknown,
): void {
  res.status(status).json({
    success: false,
    error: message,
    ...(details ? { details } : {}),
  });
}
