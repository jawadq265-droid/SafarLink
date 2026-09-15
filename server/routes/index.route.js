import {Router} from 'express';
import chatbotRouter from "./chatbot.route.js";
import authRoutes from "./auth.route.js";
import paymentRouter from "./payment.route.js";
import busRouter from "./bus.route.js";

const router = Router();

router.use("/chatbot", chatbotRouter);
router.use("/auth", authRoutes);
router.use("/payment", paymentRouter);
router.use("/buses", busRouter);

export default router;
