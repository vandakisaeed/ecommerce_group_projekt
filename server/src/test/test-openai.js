// src/test/test-openai.js
import 'dotenv/config'; // automatically loads .env
import OpenAI from 'openai';

(async () => {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello OpenAI, are you working?" }],
    });
    console.log("✅ OpenAI works! Response:", response.choices[0].message.content);
  } catch (err) {
    console.error("❌ OpenAI error:", err);
  }
})();
