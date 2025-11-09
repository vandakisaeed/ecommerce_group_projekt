import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

(async () => {
  try {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

    const resp = await client.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: "Hello Gemini, are you working?" }] }],
      config: { temperature: 0.2, maxOutputTokens: 50 },
    });

    // Parse the response safely
    let text;
    if (resp.text) text = resp.text;
    else if (resp.response?.text) text = resp.response.text;
    else if (resp.response?.candidates?.[0]?.content?.[0]?.text)
      text = resp.response.candidates[0].content[0].text;
    else text = JSON.stringify(resp, null, 2); // fallback

    console.log("✅ Gemini works! Response:", text);

  } catch (err) {
    console.error("❌ Gemini error:", err);
  }
})();
