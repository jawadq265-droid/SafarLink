import {Router} from 'express';
import chatbotRouter from "./chatbot.route.js";
import authRoutes from "./auth.route.js";

const router = Router();

router.use("/chatbot", chatbotRouter);
router.use("/auth", authRoutes);

export default router;
