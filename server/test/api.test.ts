import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { Product } from "../src/models/Product";
import { Coupon } from "../src/models/Coupon";
import { Order } from "../src/models/Order";
import { Appointment } from "../src/models/Appointment";
import { ContactMessage } from "../src/models/ContactMessage";
import { Faq } from "../src/models/Faq";
import {
  clearTestDb,
  futureDate,
  sampleProduct,
  startTestDb,
  stopTestDb,
  validOrderPayload,
} from "./setup";

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(async () => {
  await clearTestDb();
  await Product.create(sampleProduct);
});

describe("GET /health", () => {
  it("reports ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: "ok" } });
  });
});

describe("products", () => {
  it("lists products with pagination metadata", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].slug).toBe(sampleProduct.slug);
  });

  it("filters by category, ignoring case and dashes", async () => {
    const ok = await request(app).get("/api/products?category=Wedding");
    expect(ok.body.data.total).toBe(1);
    const miss = await request(app).get("/api/products?category=suits");
    expect(miss.body.data.total).toBe(0);
  });

  it("filters by price range and search", async () => {
    const ok = await request(app).get("/api/products?minPrice=40000&maxPrice=50000");
    expect(ok.body.data.total).toBe(1);
    const miss = await request(app).get("/api/products?maxPrice=1000");
    expect(miss.body.data.total).toBe(0);
    const search = await request(app).get("/api/products?search=Sherwani");
    expect(search.body.data.total).toBe(1);
  });

  it("sorts by price", async () => {
    await Product.create({
      ...sampleProduct,
      id: "sage-short-kurta",
      slug: "sage-short-kurta",
      name: "Sage Short Kurta",
      price: 6900,
    });
    const res = await request(app).get("/api/products?sort=price_asc");
    expect(res.body.data.items.map((p: { price: number }) => p.price)).toEqual([
      6900, 45900,
    ]);
  });

  it("rejects an unknown sort value", async () => {
    const res = await request(app).get("/api/products?sort=cheapest");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("returns a single product by slug", async () => {
    const res = await request(app).get(`/api/products/${sampleProduct.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(sampleProduct.name);
  });

  it("404s for an unknown slug", async () => {
    const res = await request(app).get("/api/products/not-a-real-piece");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it("returns related products from the same category", async () => {
    await Product.create({
      ...sampleProduct,
      id: "ivory-pearl-groom-sherwani",
      slug: "ivory-pearl-groom-sherwani",
      name: "Ivory Pearl Groom Sherwani",
    });
    const res = await request(app).get(
      `/api/products/${sampleProduct.slug}/related`,
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].slug).toBe("ivory-pearl-groom-sherwani");
  });
});

describe("POST /api/orders", () => {
  it("creates an order using database pricing", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        ...validOrderPayload,
        items: [
          {
            ...validOrderPayload.items[0],
            price: 1,
            name: "Tampered name",
          },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.items[0].price).toBe(45900);
    expect(res.body.data.items[0].name).toBe("Wine Sherwani");
    expect(res.body.data.subtotal).toBe(45900);
    expect(res.body.data.total).toBe(45900);
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.id).toBeTruthy();
    expect(await Order.countDocuments()).toBe(1);
  });

  it("rejects an unknown product", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        ...validOrderPayload,
        items: [{ ...validOrderPayload.items[0], slug: "ghost-piece" }],
      });
    expect(res.status).toBe(400);
    expect(await Order.countDocuments()).toBe(0);
  });

  it("rejects an unavailable size or colour", async () => {
    const badSize = await request(app)
      .post("/api/orders")
      .send({
        ...validOrderPayload,
        items: [{ ...validOrderPayload.items[0], size: "XXXL" }],
      });
    expect(badSize.status).toBe(400);

    const badColor = await request(app)
      .post("/api/orders")
      .send({
        ...validOrderPayload,
        items: [{ ...validOrderPayload.items[0], color: "Neon" }],
      });
    expect(badColor.status).toBe(400);
    expect(await Order.countDocuments()).toBe(0);
  });

  it("rejects an out-of-stock product", async () => {
    await Product.updateOne({ slug: sampleProduct.slug }, { inStock: false });
    const res = await request(app)
      .post("/api/orders")
      .send(validOrderPayload);
    expect(res.status).toBe(400);
  });

  it("validates the request body", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validOrderPayload, customer: { name: "A", email: "nope", phone: "1" } });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it("applies an active coupon", async () => {
    await Coupon.create({ code: "NOOR10", discountPercent: 10, active: true });
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validOrderPayload, couponCode: "noor10" });
    expect(res.status).toBe(201);
    expect(res.body.data.discount).toBe(4590);
    expect(res.body.data.total).toBe(41310);
    expect(res.body.data.couponCode).toBe("NOOR10");
  });

  it("rejects an expired coupon", async () => {
    await Coupon.create({
      code: "OLD10",
      discountPercent: 10,
      active: true,
      expiresAt: new Date(Date.now() - 86400000),
    });
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validOrderPayload, couponCode: "OLD10" });
    expect(res.status).toBe(400);
  });

  it("fetches the order back by id", async () => {
    const created = await request(app)
      .post("/api/orders")
      .send(validOrderPayload);
    const res = await request(app).get(`/api/orders/${created.body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.body.data.id);
  });

  it("404s for an unknown order id", async () => {
    const res = await request(app).get("/api/orders/64b7f1f1f1f1f1f1f1f1f1f1");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/coupons/validate", () => {
  it("accepts an active coupon", async () => {
    await Coupon.create({ code: "NOOR10", discountPercent: 10, active: true });
    const res = await request(app)
      .post("/api/coupons/validate")
      .send({ code: "NOOR10", subtotal: 20000 });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      valid: true,
      discountPercent: 10,
      discount: 2000,
    });
  });

  it("returns valid:false for an unknown code instead of an error", async () => {
    const res = await request(app)
      .post("/api/coupons/validate")
      .send({ code: "NOPE", subtotal: 20000 });
    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(false);
    expect(res.body.data.discountPercent).toBe(0);
  });

  it("returns valid:false for an inactive coupon", async () => {
    await Coupon.create({ code: "NOOR10", discountPercent: 10, active: false });
    const res = await request(app)
      .post("/api/coupons/validate")
      .send({ code: "NOOR10", subtotal: 20000 });
    expect(res.body.data.valid).toBe(false);
  });

  it("returns valid:false for an expired coupon", async () => {
    await Coupon.create({
      code: "NOOR10",
      discountPercent: 10,
      active: true,
      expiresAt: new Date(Date.now() - 1000),
    });
    const res = await request(app)
      .post("/api/coupons/validate")
      .send({ code: "NOOR10", subtotal: 20000 });
    expect(res.body.data.valid).toBe(false);
  });
});

describe("POST /api/appointments", () => {
  it("stores an appointment request", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({
        garmentType: "Sherwani",
        occasion: "Wedding",
        preferredDate: futureDate(5),
        contactMethod: "in-store",
        name: "Aarav Mehta",
        phone: "+91 9876543210",
        notes: "Lightweight wool if possible",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeTruthy();
    expect(await Appointment.countDocuments()).toBe(1);
  });

  it("rejects a past preferred date", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({
        garmentType: "Sherwani",
        occasion: "Wedding",
        preferredDate: "2020-01-01",
        contactMethod: "call",
        name: "Aarav Mehta",
        phone: "+91 9876543210",
      });
    expect(res.status).toBe(400);
    expect(await Appointment.countDocuments()).toBe(0);
  });

  it("rejects an invalid contact method", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({
        garmentType: "Sherwani",
        occasion: "Wedding",
        preferredDate: futureDate(5),
        contactMethod: "email",
        name: "Aarav Mehta",
        phone: "+91 9876543210",
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/contact", () => {
  it("stores a contact message", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        name: "Riya Shah",
        email: "riya@example.com",
        message: "I would like to book a consultation for my wedding.",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("riya@example.com");
    expect(await ContactMessage.countDocuments()).toBe(1);
  });

  it("rejects an invalid email", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Riya Shah", email: "not-an-email", message: "Hello" });
    expect(res.status).toBe(400);
  });
});

describe("content and errors", () => {
  it("returns FAQs", async () => {
    await Faq.create({ q: "How long does delivery take?", a: "2-4 days." });
    const res = await request(app).get("/api/content/faqs");
    expect(res.status).toBe(200);
    expect(res.body.data[0].q).toBe("How long does delivery take?");
  });

  it("blocks Mongo operator injection in the query string", async () => {
    const res = await request(app).get(
      `/api/products?category[$ne]=${encodeURIComponent("Suits")}`,
    );
    expect(res.status).toBe(400);
  });

  it("returns a structured 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, error: "Route not found." });
  });
});
