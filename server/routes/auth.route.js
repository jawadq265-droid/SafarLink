import express from "express"
import { signup, login, forgotPassword, resetPassword, subscribeNewsletter, contactQuery, clearSubscribers } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/subscribe", subscribeNewsletter);
router.post("/contact", contactQuery);
router.post("/clear-subscribers", clearSubscribers);

export default router;