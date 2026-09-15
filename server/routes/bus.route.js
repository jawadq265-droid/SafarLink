import { Router } from "express";
import {
  getBuses,
  getPopularRoutes,
  createBus,
  updateBus,
  deleteBus,
  togglePopularRoute
} from "../controller/bus.controller.js";

const router = Router();

router.get("/", getBuses);
router.get("/popular", getPopularRoutes);
router.post("/", createBus);
router.put("/:id", updateBus);
router.delete("/:id", deleteBus);
router.patch("/:id/toggle-popular", togglePopularRoute);

export default router;
