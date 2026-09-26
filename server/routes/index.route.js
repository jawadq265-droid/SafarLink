import {Router} from 'express';
import chatbotRouter from "./chatbot.route.js";
import authRoutes from "./auth.route.js";
import paymentRouter from "./payment.route.js";
import busRouter from "./bus.route.js";
import promotionRouter from "./promotion.route.js";
import userRouter from "./user.route.js";

const router = Router();

router.use("/chatbot", chatbotRouter);
router.use("/auth", authRoutes);
router.use("/payment", paymentRouter);
router.use("/buses", busRouter);
router.use("/promotions", promotionRouter);
router.use("/users", userRouter);

export default router;
