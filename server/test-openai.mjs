import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("🔍 Loading test...");
console.log("API key starts with:", process.env.OPENAI_API_KEY?.slice(0, 5) || "(undefined)");

import OpenAI from "openai";
console.log("✅ OpenAI module imported");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("🚀 OpenAI client created");

try {
  console.log("💬 Sending request to OpenAI API...");
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say hello from OpenAI!" }],
  });

  console.log("✅ API call succeeded!");
  console.log("Response:", response.choices[0].message.content);
} catch (err) {
  console.error("❌ OpenAI test failed:", err);
}
