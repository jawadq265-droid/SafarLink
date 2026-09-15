import { Router } from "express";
import {
  getBuses,
  getPopularRoutes,
  createBus,
  updateBus,
  deleteBus,
  togglePopularRoute,
  updateBusStatus
} from "../controller/bus.controller.js";

const router = Router();

router.get("/", getBuses);
router.get("/popular", getPopularRoutes);
router.post("/", createBus);
router.put("/:id", updateBus);
router.delete("/:id", deleteBus);
router.patch("/:id/toggle-popular", togglePopularRoute);
router.patch("/:id/status", updateBusStatus);

export default router;
