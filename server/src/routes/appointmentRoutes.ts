import { Router } from "express";
import { createAppointment } from "../controllers/appointmentController.js";
import { createRateLimiter } from "../middleware.js";
import { env } from "../config/env.js";

const router = Router();
const limiter = createRateLimiter(20, env.RATE_LIMIT_WINDOW_MS);

router.post("/", limiter, createAppointment);

export default router;