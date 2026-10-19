import { Router } from "express";
import {
  listProducts,
  getProductBySlug,
  getRelatedProducts,
  getCategories,
} from "../controllers/productController.js";
import { sanitizeMongo } from "../middleware/index.js";

const router = Router();

router.get("/", sanitizeMongo, listProducts);
router.get("/categories", sanitizeMongo, getCategories);
router.get("/:slug", sanitizeMongo, getProductBySlug);
router.get("/:slug/related", sanitizeMongo, getRelatedProducts);

export default router;