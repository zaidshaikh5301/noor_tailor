import { Router } from "express";
import {
  getFaqs,
  getTestimonials,
  getStoreInfo,
  getCollections,
} from "../controllers/contentController.js";

const router = Router();

router.get("/faqs", getFaqs);
router.get("/testimonials", getTestimonials);
router.get("/store-info", getStoreInfo);
router.get("/collections", getCollections);

export default router;