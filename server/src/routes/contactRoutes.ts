import { Router } from "express";
import { createContactMessage } from "../controllers/contactController.js";
import { createRateLimiter } from "../middleware.js";
import { env } from "../config/env.js";

const router = Router();
const limiter = createRateLimiter(20, env.RATE_LIMIT_WINDOW_MS);

router.post("/", limiter, createContactMessage);

export default router;