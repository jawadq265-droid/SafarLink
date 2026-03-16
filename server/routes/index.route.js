import {Router} from 'express';
import chatbotRouter from "./chatbot.route.js";

const router = Router();

router.use("/chatbot", chatbotRouter);


export default router;
