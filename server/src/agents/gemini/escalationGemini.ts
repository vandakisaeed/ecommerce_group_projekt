/**
 * ESCALATION AGENT (Gemini)
 * Handles frustrated or angry customers with empathy and resolution focus
 */

import { GoogleGenAI } from "@google/genai";
import { createSupportTicket } from "#utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Escalation agent for Gemini — detects customer frustration,
 * responds with empathy, and optionally creates a support ticket.
 */
export async function escalationAgentGemini(query: string, p0: string) {
  const systemInstructions = `
You are an escalation specialist for CloudPillow Co.

Your mission: handle upset or frustrated customers with maximum empathy.

Your approach:
- Acknowledge their frustration immediately
- Apologize sincerely for inconvenience
- Offer concrete solutions (replacement, expedited shipping, discount)
- Create a support ticket for tracking if needed
- Assure them a manager will follow up within 24 hours
- Always be calm, patient, and solution-focused

If you determine this query requires escalation, return JSON:
{
  "requiresEscalation": true,
  "customerIssue": "brief summary of the issue",
  "severity": "high" | "urgent",
  "response": "empathetic message to send to the customer"
}

If escalation is not needed:
{
  "requiresEscalation": false,
  "response": "short supportive message (no escalation)"
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
            requiresEscalation: { type: "boolean" },
            customerIssue: { type: "string" },
            severity: {
              type: "string",
              enum: ["high", "urgent"],
            },
            response: { type: "string" },
          },
          required: ["requiresEscalation", "response"],
        },
      },
    });

   // ✅ Use .text() method safely
    const text = response.text ?? ""; // fallback to empty string
    if (!text.trim()) {
      throw new Error("Gemini returned an empty or non-text response.");
    }

    const json = JSON.parse(text);

    // If escalation is required, trigger the ticket tool
    if (json.requiresEscalation) {
      console.log(
        `\x1b[31m🎫 ESCALATION DETECTED: [${json.severity?.toUpperCase() || "HIGH"}] ${json.customerIssue}\x1b[0m`
      );
      await createSupportTicket({
        customerIssue: json.customerIssue || query,
        severity: json.severity || "high",
      });
    }

    return {
      success: true,
      ...json,
    };
  } catch (error) {
    console.error("❌ Escalation Agent (Gemini) Error:", error);
    return {
      success: false,
      requiresEscalation: false,
      response: "We’re sorry — the escalation system encountered an error.",
    };
  }
}
