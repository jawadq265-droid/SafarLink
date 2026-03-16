import fetch from "node-fetch";

export async function askOpenRouter(message) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [{ role: "user", content: message }],
    }),
  });
console.log("Response received:", res);

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
  console.log("API data:", data);
}