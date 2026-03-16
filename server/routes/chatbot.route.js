import express from "express";
import { chatWithBot } from "../controller/chatbot.controller.js";

const chatbotRouter = express.Router();

chatbotRouter.post("/chat", chatWithBot);

export default chatbotRouter;
