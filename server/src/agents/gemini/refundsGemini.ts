import { GoogleGenAI, Type } from "@google/genai";
import { getModelConfig  } from "./configGemini.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Local utility to simulate refund processing
 * Replace with your real backend logic
 */
async function processRefundRequest({
  orderNumber,
  reason,
  preferExchange,
}: {
  orderNumber: string;
  reason: string;
  preferExchange: boolean;
}) {
  const refundId = `RF-${Math.floor(Math.random() * 1000000)}`;
  const message = preferExchange
    ? `Exchange initiated for order ${orderNumber}. Replacement will ship within 3 business days.`
    : `Refund for order ${orderNumber} has been initiated. Expect completion in 3–5 business days.`;

  return { refundId, orderNumber, reason, preferExchange, message };
}

/**
 * Define the refund-processing tool for Gemini
 */
const processRefundTool = {
  name: "process_refund",
  description: "Initiate a refund or return process for a customer",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderNumber: { type: Type.STRING, description: 'Customer order number (or "PENDING")' },
      reason: { type: Type.STRING, description: "Reason for return/refund" },
      preferExchange: { type: Type.BOOLEAN, description: "Customer prefers exchange instead of refund" },
    },
    required: ["orderNumber", "reason", "preferExchange"],
  },
};

/**
 * Gemini Refunds Agent
 */
export async function refundsAgentGemini(query: string) {
  const modelai = getModelConfig()
  const systemInstructions = `
You are a refunds and returns specialist for CloudPillow Co.
Handle returns, refunds, and warranty claims professionally.

Policies:
- 30-day money-back guarantee
- Lifetime warranty for manufacturing defects
- Free return shipping
- Refunds processed in 3–5 business days
- Exchanges processed faster

Approach:
- Ask for order number or purchase date
- Explain the process clearly
- Offer exchange as alternative
- Process refunds using the process_refund tool
- Be understanding and efficient
`;

  try {
    const response = await ai.models.generateContent({
      model: modelai as string,
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction: systemInstructions,
        tools: [{ functionDeclarations: [processRefundTool] }],
      },
    });

    // --- 1. Check for function call ---
    const fnCall = response.functionCalls?.[0];
    if (fnCall?.name === "process_refund") {
      const args = fnCall.args as { orderNumber: string; reason: string; preferExchange: boolean };
      console.log(
        `\x1b[33m🔄 REFUND REQUEST: Order #${args.orderNumber} - ${args.reason} (Exchange: ${args.preferExchange})\x1b[0m`
      );
      const result = await processRefundRequest(args);
      return `✅ ${result.message} (Tracking ID: ${result.refundId})`;
    }

    // --- 2. Safe access to text response ---
    // ✅ Use .text() method safely
    const text = response.text ?? ""; // fallback to empty string
    if (!text.trim()) {
      throw new Error("Gemini returned an empty or non-text response.");
    }

    return text;

  } catch (error) {
    console.error("❌ Refunds Agent (Gemini) failed:", error);
    return "Refund system error. Please try again later.";
  }
}
