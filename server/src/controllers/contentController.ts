import { Request, Response } from "express";
import { Faq } from "../models/Faq.js";
import { Testimonial } from "../models/Testimonial.js";
import { Category } from "../models/Category.js";
import { StoreInfo } from "../models/StoreInfo.js";
import { Collection } from "../models/Collection.js";
import { catchAsync, sendSuccess } from "../utils/apiResponse.js";

export const getFaqs = catchAsync(async (_req: Request, res: Response) => {
  const items = await Faq.find().sort({ createdAt: 1 }).lean();
  sendSuccess(res, items);
});

export const getTestimonials = catchAsync(async (_req: Request, res: Response) => {
  const items = await Testimonial.find().sort({ createdAt: 1 }).lean();
  sendSuccess(res, items);
});

export const getStoreInfo = catchAsync(async (_req: Request, res: Response) => {
  const info = await StoreInfo.findOne().lean();
  if (!info) {
    return sendSuccess(res, {
      name: "Noor Tailor",
      address: "",
      hours: "",
      phone: "",
      whatsapp: "",
    });
  }
  sendSuccess(res, info);
});

export const getCollections = catchAsync(async (_req: Request, res: Response) => {
  const items = await Collection.find().sort({ createdAt: 1 }).lean();
  sendSuccess(res, items);
});

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const items = await Category.find().sort({ name: 1 }).lean();
  sendSuccess(res, items);
});