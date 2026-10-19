import { Router } from "express";
import { createAppointment } from "../controllers/appointmentController.js";
import { createRateLimiter, sanitizeMongo } from "../middleware/index.js";
import { env } from "../config/env.js";

const router = Router();
const limiter = createRateLimiter(20, env.RATE_LIMIT_WINDOW_MS);

router.post("/", limiter, sanitizeMongo, createAppointment);

export default router;