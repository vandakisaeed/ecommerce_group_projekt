import OpenAI from "openai";
import "dotenv/config"; // load .env
import fetch from "node-fetch";
(globalThis ).fetch = fetch;

const client = new OpenAI({
  apiKey: process.env.OLLAMA_API_KEY,
  baseURL: process.env.OLLAMA_URL,
});

async function testOllama() {
  try {
    const result = await client.chat.completions.create({
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
      messages: [{ role: "user", content: "Hello from Node!" }],
    });

    console.log("✅ Ollama works:", result);
  } catch (err) {
    console.error("Ollama error:", err);
  }
}

testOllama();
