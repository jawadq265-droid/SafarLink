import { Router } from "express";
import {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  notifySubscribers,
  validatePromoCode,
} from "../controller/promotion.controller.js";

const router = Router();

// Public validation endpoint for users at checkout
router.post("/validate", validatePromoCode);

// Admin / Super Admin endpoints
router.get("/", getPromotions);
router.get("/:id", getPromotionById);
router.post("/", createPromotion);
router.put("/:id", updatePromotion);
router.delete("/:id", deletePromotion);
router.patch("/:id/toggle-status", togglePromotionStatus);
router.post("/:id/notify-subscribers", notifySubscribers);

export default router;
