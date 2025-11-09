import { GoogleGenAI, Type } from "@google/genai";
import { refundsAgentGemini } from "./refundsGemini.ts";
import { customerSupportAgentGemini } from "./customerSupportGemini.ts";
import { salesAgentGemini } from "./salesGemini.ts";
import { escalationAgentGemini } from "./escalationGemini.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// --- Routing function that calls the actual Gemini agents ---
async function routeCustomerQuery(
  agent: "customerSupport" | "sales" | "refunds" | "escalation",
  query: string,
  reason?: string
) {
  switch (agent) {
    case "customerSupport":
      return customerSupportAgentGemini(query);
    case "sales":
      return salesAgentGemini(query);
    case "refunds":
      return refundsAgentGemini(query);
    case "escalation":
      return escalationAgentGemini(query, reason ?? "Urgent issue or angry customer");
  }
}

// --- Tool definition for function-calling in Gemini ---
const routeCustomerQueryTool = {
  name: "routeCustomerQuery",
  description:
    "Routes the customer's query to the most appropriate specialist agent based on their request and tone.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      agent: {
        type: Type.STRING,
        description: "The name of the specialist agent to route the query to.",
        enum: ["customerSupport", "sales", "refunds", "escalation"],
      },
      query: {
        type: Type.STRING,
        description: "The original customer query to pass to the specialist agent.",
      },
      reason: {
        type: Type.STRING,
        description:
          "ONLY required if routing to 'escalation'. State why the customer is being escalated.",
      },
    },
    required: ["agent", "query"],
  },
};

// --- Guardrail: ensures query is relevant to CloudPillow Co. ---
async function checkRelevanceGuardrail(query: string): Promise<boolean> {
  const prompt = `
  Respond ONLY with {"isRelevant": true} or {"isRelevant": false}.
  Is the following customer query relevant to a pillow company?
  QUERY: "${query}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or gemini-2.5-pro
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.text ?? "";
    const match = text.match(/true|false/i);
    if (!match) throw new Error("No boolean found in model response");

    return match[0].toLowerCase() === "true";
  } catch (err) {
    console.error("Guardrail failed, assuming query is relevant:", err);
    return true;
  }
}


// --- Main orchestrator ---
export async function runOrchestrator(customerQuery: string) {
    console.log('🏁 Orchestrator starting...');

  console.log(`Incoming query: "${customerQuery}"`);

  // 1️⃣ Guardrail check
  const isRelevant = await checkRelevanceGuardrail(customerQuery);
  if (!isRelevant) {
    console.log("🛑 Guardrail tripwire triggered");
    return "Your query seems unrelated to CloudPillow Co. Please ask about products, shipping, or services.";
  }

  console.log("✅ Passed guardrail. Routing...");

  const instructions = `
You are the triage agent for CloudPillow Co. customer support.
Your ONLY job is to decide which specialized agent handles the customer's query.
- upset/angry/frustrated → 'escalation' with reason
- pricing/bulk orders → 'sales'
- return/refund/exchange → 'refunds'
- general product/shipping/warranty questions → 'customerSupport'
Do NOT answer the query yourself. Output MUST call 'routeCustomerQuery'.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: customerQuery }] }],
      config: {
        systemInstruction: instructions,
        tools: [{ functionDeclarations: [routeCustomerQueryTool] }],
      },
    });

    // ✅ Access text as a property, not a function
    const text = response.text ?? "";

    // 2️⃣ Check for function call first
    const fnCall = response.functionCalls?.[0];
    if (fnCall && fnCall.args) {
      const args = fnCall.args as {
        agent: "customerSupport" | "sales" | "refunds" | "escalation";
        query: string;
        reason?: string;
      };
      const result = await routeCustomerQuery(args.agent, args.query, args.reason);
      return result;
    }

    // 3️⃣ Fallback: no function call, return text
    if (text.trim()) return text.trim();

    // 4️⃣ Final fallback: default to customer support
    console.warn("⚠️ Model didn't call routing function and returned no text, defaulting to customer support");
    return customerSupportAgentGemini(customerQuery);
    
  } catch (error) {
    console.error("Orchestrator failed:", error);
    return "An unexpected system error occurred during routing.";
  }
}
