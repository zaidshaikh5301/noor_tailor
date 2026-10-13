import { z } from "zod";

const phoneRegex = /^[0-9+\-\s]{7,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pincodeRegex = /^[0-9]{6}$/;

export const productQuerySchema = z.object({
  category: z.string().trim().optional(),
  subcategory: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  size: z.string().trim().optional(),
  fabric: z.string().trim().optional(),
  occasion: z.string().trim().optional(),
  color: z.string().trim().optional(),
  search: z.string().trim().optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "popularity"])
    .default("newest"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(24),
});

export const orderItemSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1).max(10),
  size: z.string().trim().min(1),
  color: z.string().trim().min(1),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  customer: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().regex(emailRegex, "Enter a valid email address"),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  }),
  address: z.object({
    line1: z.string().trim().min(1, "Street address is required"),
    line2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    pincode: z.string().trim().regex(pincodeRegex, "Enter a six-digit PIN code"),
  }),
  couponCode: z.string().trim().optional(),
});

export const couponValidateSchema = z.object({
  code: z.string().trim().min(1, "Offer code is required"),
  subtotal: z.number().min(0),
});

export const appointmentSchema = z.object({
  garmentType: z.string().trim().min(1, "Garment type is required"),
  occasion: z.string().trim().min(1, "Occasion is required"),
  preferredDate: z.string().trim().min(1, "Preferred date is required"),
  contactMethod: z.enum(["in-store", "call"], {
    errorMap: () => ({ message: "Choose in-store or call" }),
  }),
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().trim().regex(emailRegex, "Enter a valid email address").optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().regex(emailRegex, "Enter a valid email address"),
  message: z.string().trim().min(1, "Tell us what you need"),
});

export function zodErrorDetails(error: z.ZodError): unknown {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}