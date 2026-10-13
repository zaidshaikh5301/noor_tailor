import { Request, Response, NextFunction } from "express";
import { ContactMessage } from "../models/ContactMessage.js";
import { ApiError, catchAsync, sendError, sendSuccess } from "../utils/apiResponse.js";
import { contactMessageSchema, zodErrorDetails } from "../utils/validation.js";

export const createContactMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = contactMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, "Please check your message.", zodErrorDetails(parsed.error));
    }
    const message = await ContactMessage.create({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    sendSuccess(
      res,
      {
        id: String(message._id),
        name: message.name,
        email: message.email,
        message: message.message,
        createdAt: message.createdAt,
      },
      201,
    );
  },
);