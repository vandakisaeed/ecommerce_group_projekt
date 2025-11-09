import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function salesAgentGemini(query: string) {
  const systemInstructions = `
You are a sales specialist for CloudPillow Co.
Your role:
- Provide pricing information for all products
- Calculate bulk discounts (10% for 5+ items, 20% for 10+ items)
- Inform about current promotions (e.g., 20% off first order with code CLOUD20)
- Suggest product bundles for better value
- Be enthusiastic but not pushy

Products:
- CloudDream Memory Foam: $79.99
- SkyFeather Down Pillow: $99.99
- BambooCool Hypoallergenic: $89.99

Return your answer ONLY in JSON format:
{
  "response": "text answer to the customer",
  "product": "CloudDream" | "SkyFeather" | "BambooCool" | "all"
}
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            product: {
              type: Type.STRING,
              enum: ["CloudDream", "SkyFeather", "BambooCool", "all"],
            },
          },
          required: ["response", "product"],
        },
      },
    });

    // ✅ Use .text() method safely
    const text = result.text ?? ""; // fallback to empty string
    if (!text.trim()) {
      throw new Error("Gemini returned an empty or non-text response.");
    }



    const json = JSON.parse(text);
    return {
      success: true,
      ...json,
    };
  } catch (error) {
    console.error("❌ Sales Agent (Gemini) Error:", error);
    return {
      success: false,
      response:
        "Sorry, I couldn't process your sales query. Please try again.",
      product: "all",
    };
  }
}
