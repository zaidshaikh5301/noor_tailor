import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { ApiError, catchAsync, sendError, sendSuccess } from "../utils/apiResponse.js";
import { productQuerySchema, zodErrorDetails } from "../utils/validation.js";

function normalizeCategory(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/-/g, "").toLowerCase();
}

export const listProducts = catchAsync(async (req: Request, res: Response) => {
  const parsed = productQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid query parameters.", zodErrorDetails(parsed.error));
  }
  const q = parsed.data;
  const filter: Record<string, unknown> = {};
  const category = normalizeCategory(q.category);
  if (category) filter.category = new RegExp(`^${category}$`, "i");
  if (q.subcategory) {
    filter.subcategory = new RegExp(`^${q.subcategory.replace(/-/g, " ")}$`, "i");
  }
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    filter.price = {};
    if (q.minPrice !== undefined) (filter.price as any).$gte = q.minPrice;
    if (q.maxPrice !== undefined) (filter.price as any).$lte = q.maxPrice;
  }
  if (q.size) filter.sizes = q.size;
  if (q.fabric) filter.fabric = new RegExp(q.fabric, "i");
  if (q.occasion) filter.occasion = q.occasion;
  if (q.color) filter.colors = { $elemMatch: { name: new RegExp(`^${q.color}$`, "i") } };
  if (q.search) {
    filter.$or = [
      { name: new RegExp(q.search, "i") },
      { fabric: new RegExp(q.search, "i") },
      { description: new RegExp(q.search, "i") },
      { tags: new RegExp(q.search, "i") },
    ];
  }
  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (q.sort === "price_asc") sort = { price: 1 };
  else if (q.sort === "price_desc") sort = { price: -1 };
  else if (q.sort === "popularity") sort = { isBestseller: -1, createdAt: -1 };

  const page = q.page;
  const limit = q.limit;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  sendSuccess(res, { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

export const getProductBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const slug = String(req.params.slug).trim();
  const product = await Product.findOne({ slug }).lean();
  if (!product) return next(new ApiError("Product not found.", 404));
  sendSuccess(res, product);
});

export const getRelatedProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const slug = String(req.params.slug).trim();
  const product = await Product.findOne({ slug }).lean();
  if (!product) return next(new ApiError("Product not found.", 404));
  const items = await Product.find({
    category: new RegExp(`^${product.category}$`, "i"),
    slug: { $ne: slug },
  })
    .sort({ isBestseller: -1, createdAt: -1 })
    .limit(4)
    .lean();
  sendSuccess(res, items);
});

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const items = await Category.find().sort({ name: 1 }).lean();
  sendSuccess(res, items);
});