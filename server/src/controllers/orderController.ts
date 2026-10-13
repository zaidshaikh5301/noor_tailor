import { Request, Response, NextFunction } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import {
  ApiError,
  catchAsync,
  sendError,
  sendSuccess,
} from "../utils/apiResponse.js";
import {
  orderSchema,
  couponValidateSchema,
  zodErrorDetails,
} from "../utils/validation.js";

type ResolvedItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
};

export const createOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(
        res,
        400,
        "Please check your order details.",
        zodErrorDetails(parsed.error),
      );
    }
    const data = parsed.data;

    const slugs = [...new Set(data.items.map((item) => item.slug))];
    const products = await Product.find({ slug: { $in: slugs } });
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const items: ResolvedItem[] = [];
    for (const item of data.items) {
      const product = bySlug.get(item.slug);
      if (!product) {
        throw new ApiError(`"${item.name}" is no longer available.`, 400);
      }
      if (!product.inStock) {
        throw new ApiError(`"${product.name}" is out of stock.`, 400);
      }
      if (!product.sizes.includes(item.size)) {
        throw new ApiError(
          `Size ${item.size} is not available for "${product.name}".`,
          400,
        );
      }
      if (!product.colors.some((c) => c.name === item.color)) {
        throw new ApiError(
          `Colour ${item.color} is not available for "${product.name}".`,
          400,
        );
      }
      items.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    let discount = 0;
    let couponCode: string | undefined;
    if (data.couponCode) {
      const couponCheck = couponValidateSchema.safeParse({
        code: data.couponCode,
        subtotal,
      });
      if (!couponCheck.success) {
        return sendError(
          res,
          400,
          "Invalid offer code.",
          zodErrorDetails(couponCheck.error),
        );
      }
      const coupon = await Coupon.findOne({
        code: data.couponCode.trim().toUpperCase(),
        active: true,
      });
      if (!coupon) {
        return sendError(res, 400, "That offer code is not recognised.");
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return sendError(res, 400, "That offer code has expired.");
      }
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      couponCode = coupon.code;
    }

    const total = Math.max(0, subtotal - discount);
    const order = await Order.create({
      items,
      customer: data.customer,
      address: data.address,
      couponCode,
      discount,
      subtotal,
      total,
      status: "pending",
    });

    sendSuccess(
      res,
      {
        id: String(order._id),
        items: order.items,
        customer: order.customer,
        address: order.address,
        couponCode: order.couponCode,
        discount: order.discount,
        subtotal: order.subtotal,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
      201,
    );
  },
);

export const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const parsed = couponValidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(
      res,
      400,
      "Invalid request.",
      zodErrorDetails(parsed.error),
    );
  }
  const { code, subtotal } = parsed.data;
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true });
  if (!coupon) {
    return sendSuccess(res, {
      valid: false,
      discountPercent: 0,
      message: "That offer code is not recognised.",
    });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return sendSuccess(res, {
      valid: false,
      discountPercent: 0,
      message: "That offer code has expired.",
    });
  }
  const discount = Math.round((subtotal * coupon.discountPercent) / 100);
  sendSuccess(res, {
    valid: true,
    discountPercent: coupon.discountPercent,
    discount,
    message: `${coupon.discountPercent}% offer applied.`,
  });
});

export const getOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return next(new ApiError("Order not found.", 404));
    sendSuccess(res, { ...order, id: String(order._id) });
  },
);
