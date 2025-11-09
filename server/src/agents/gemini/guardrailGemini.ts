/**
 * GUARDRAIL AGENT (Gemini)
 * Validates that customer queries are related to CloudPillow Co. products/services
 * Acts as a gatekeeper before expensive agent processing
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function guardrailAgentGemini(query: string) {
  const systemInstructions = `
You are the Intent Guardrail for CloudPillow Co.
You validate if customer questions are about CloudPillow Co. products and services.

CloudPillow Co. sells premium pillows (memory foam, down, bamboo).

RELEVANT topics:
- Questions about pillows, bedding, sleep products
- Orders, shipping, returns, refunds
- Product features, prices, materials
- Warranty, customer support
- Anything remotely related to our products or services

IRRELEVANT topics:
- Completely unrelated subjects (politics, recipes, math, etc.)
- Questions about other companies' products
- General knowledge questions with no connection to our business

Be lenient: if there's ANY connection to our business, mark it as relevant.
Only reject if it's clearly off-topic.

Return a JSON object with the following:
{
  "isRelevant": boolean,
  "reasoning": string
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            isRelevant: { type: "boolean" },
            reasoning: { type: "string" },
          },
          required: ["isRelevant", "reasoning"],
        },
      },
    });

    // ✅ Use .text() method safely
    const text = response.text ?? ""; // fallback to empty string
    if (!text.trim()) {
      throw new Error("Gemini returned an empty or non-text response.");
    }

    const json = JSON.parse(text);
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // Fallback in case the model didn't return JSON
      result = {
        isRelevant: text.toLowerCase().includes("pillow"),
        reasoning: "Heuristic fallback: model did not return JSON.",
      };
    }

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("❌ Guardrail Agent (Gemini) Error:", error);
    return {
      success: false,
      isRelevant: false,
      reasoning: "Guardrail agent failed to evaluate query.",
    };
  }
}
