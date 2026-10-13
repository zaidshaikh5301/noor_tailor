import { Router } from "express";
import { createOrder, getOrderById } from "../controllers/orderController.js";
import { createRateLimiter } from "../middleware.js";
import { env } from "../config/env.js";

const router = Router();
const limiter = createRateLimiter(30, env.RATE_LIMIT_WINDOW_MS);

router.post("/", limiter, createOrder);
router.get("/:id", limiter, getOrderById);

export default router;
