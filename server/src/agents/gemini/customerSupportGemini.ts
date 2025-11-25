/**
 * CUSTOMER SUPPORT AGENT (Gemini)
 * Handles general customer inquiries about products, orders, and services
 */

import { GoogleGenAI } from "@google/genai";
import { getModelConfig  } from "./configGemini.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Responds to customer support queries about CloudFitness  Co.
 */
export async function customerSupportAgentGemini(query: string) {
  const modelai = getModelConfig()
  const systemInstructions = `
You are a friendly and helpful customer support representative for Fitness Co.,
a company that sells premium cloud-soft Fitness s with a lifetime warranty.

Your role:
- Answer questions about our products (dream fit, skyfit,speed Fitness )
- Provide shipping details (2–5 business days, free over $50)
- Explain the lifetime warranty policy clearly
- Be friendly, concise, and professional
- If unsure, politely admit you’re not certain

Product lines:
- Fitness Dream  ($79.99)
- SkyFit  Fitness  ($99.99)
- Speedfit ($89.99)

Do NOT handle:
- Refunds
- Escalations
- Sales negotiations or bulk discounts

Your entire reply must be in JSON with this format:
{
  "response": "the helpful answer for the customer",
  "topic": "product" | "shipping" | "warranty" | "other"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelai as string, // fast + affordable for customer responses
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            response: { type: "string" },
            topic: {
              type: "string",
              enum: ["product", "shipping", "warranty", "other"],
            },
          },
          required: ["response", "topic"],
        },
      },
    });

    // ✅ Use .text() method safely
    const text = response.text ?? ""; // fallback to empty string
    if (!text.trim()) {
      throw new Error("Gemini returned an empty or non-text response.");
    }

    const json = JSON.parse(text);
    return {
      success: true,
      ...json,
    };
  } catch (error) {
    console.error("❌ Customer Support Agent (Gemini) Error:", error);
    return {
      success: false,
      response:
        "I'm sorry, something went wrong processing your question. Please try again shortly.",
      topic: "other",
    };
  }
}
