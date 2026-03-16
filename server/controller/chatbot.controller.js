import { getRuleReply } from "../chatbot/rules.js";
import { geminiModel } from "../config/gemini.js";
import { askOpenRouter } from "../config/openrouter.js";

export const chatWithBot = async (req, res) => {
  const { message } = req.body;

  try {
    console.log("chatWithBot called");

    // ===== GEMINI FIRST =====
    try {
      console.log("Trying GEMINI...");

      const result = await geminiModel.generateContent(message);
      const response = await result.response;
      const reply = response.text();

      if (reply) {
        console.log("Reply from GEMINI");
        return res.json({ success: true, reply });
      }

    } catch (e) {
      console.log("Gemini failed:", e.message);
    }

    // ===== RULE FALLBACK =====
    console.log("Checking RULE...");
    const ruleReply = getRuleReply(message);

    if (ruleReply) {
      console.log("Reply from RULE");
      return res.json({ success: true, reply: ruleReply });
    }

    // ===== OPENROUTER LAST =====
    console.log("Trying OPENROUTER...");
    const fallbackReply = await askOpenRouter(message);

    if (fallbackReply) {
      console.log("Reply from OPENROUTER");
      return res.json({ success: true, reply: fallbackReply });
    }

    return res.json({
      success: true,
      reply: "I’m here to help.",
    });

  } catch (error) {
    console.error("Chatbot Error:", error);

    res.status(500).json({
      success: false,
      reply: "AI unavailable",
    });
  }
};