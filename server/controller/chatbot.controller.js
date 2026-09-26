import { getRuleReply } from "../chatbot/rules.js";
import { geminiModel } from "../config/gemini.js";

export const chatWithBot = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      reply: "Please provide a valid question for SafarLink Concierge.",
    });
  }

  const cleanMessage = message.trim();

  try {
    // ===== 1. GEMINI PRIMARY =====
    try {
      const result = await geminiModel.generateContent(cleanMessage);
      const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const reply = text.trim();

      if (reply) {
        return res.json({ success: true, reply });
      }
    } catch (e) {
      console.warn("Gemini unavailable or error:", e.message);
    }

    // ===== 2. RULE FALLBACK =====
    const ruleReply = getRuleReply(cleanMessage);
    if (ruleReply) {
      return res.json({ success: true, reply: ruleReply });
    }

    // ===== 3. DEFAULT SAFARLINK FALLBACK =====
    return res.json({
      success: true,
      reply: "I apologize, but as the SafarLink AI Concierge, I can only assist with questions regarding SafarLink, bus ticket reservations, routes, and our website features. How may I assist you with your journey today?",
    });

  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    res.status(500).json({
      success: false,
      reply: "Our concierge service is temporarily experiencing difficulties. Please try again shortly or contact SafarLink support at +92 3090996833.",
    });
  }
};