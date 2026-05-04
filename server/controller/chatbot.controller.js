import { getRuleReply } from "../chatbot/rules.js";
import { geminiModel } from "../config/gemini.js";

export const chatWithBot = async (req, res) => {
  const { message } = req.body;
  console.log("chatWithBot called");

  try {
    // ===== GEMINI FIRST =====
    console.log("Trying GEMINI...");
    try {
      const result = await geminiModel.generateContent(message);

      console.log("FULL GEMINI RESPONSE:");
  console.log(JSON.stringify(result, null, 2));

     const text =result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
     const reply = text.trim();

      if (reply) {
        console.log("Reply from GEMINI");
        return res.json({ success: true, reply });
      }
    } catch (e) {
  if (e.message?.includes("429")) {
    console.log("Gemini quota hit");
  }
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

    // DEFAULT
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