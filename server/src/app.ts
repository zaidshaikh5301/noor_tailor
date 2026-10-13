import express from "express";
import type { Application } from "express";
import { securityMiddleware, errorMiddleware, notFound, sanitizeMongo } from "./middleware/index.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";

export function createApp(): Application {
  const app = express();
  app.use(securityMiddleware());
  app.use(express.json({ limit: "1mb" }));
  app.use(sanitizeMongo);

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/content", contentRoutes);

  app.use(notFound);
  app.use(errorMiddleware);
  return app;
}
