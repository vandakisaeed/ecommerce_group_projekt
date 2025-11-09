// src/controllers/ai/handleAsk.ts
// import type { Request, Response } from "express";
// import { initializeAgentClient, getModelConfig, type AgentProvider } from "#agents";
// import OpenAI from "openai";
// import { GoogleGenAI } from "@google/genai";
// export const handleAsk = async (req: Request, res: Response) => {
//   const { prompt, provider } = req.body as { prompt: string; provider?: AgentProvider };
//   const chosenProvider: AgentProvider = provider || "openai";

//   if (!prompt) {
//     return res.status(400).json({ success: false, error: "Missing prompt" });
//   }

//   try {
//     const client = initializeAgentClient(chosenProvider);
//     const model = getModelConfig(chosenProvider);

//     let text: string | undefined;

//     // OpenAI / Ollama
//     if (chosenProvider === "openai") {
//       const openAIClient = client as OpenAI;
//       const modelName = typeof model === "string" ? model : (model as any).model;

//       const completion = await openAIClient.chat.completions.create({
//         model: modelName,
//         messages: [{ role: "user", content: prompt }],
//       });

//       text = completion?.choices?.[0]?.message?.content ?? "AI did not return text";
//     }
//         if (provider === "ollama") {
//         const openAIClient = client as OpenAI;
//         const modelName =
//             typeof model === "string" ? model : (model as any).model ?? "llama3.1:8b";

//         const completion = await openAIClient.chat.completions.create({
//             model: modelName,
//             messages: [{ role: "user", content: prompt }],
//         });

//         text = completion.choices?.[0]?.message?.content ?? undefined;
//         }


// else if (provider === "gemini") {
//   const geminiClient = client as GoogleGenAI;
//   const modelName = model as string;

//   const result = await geminiClient.models.generateContent({
//     model: modelName,
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//     config: { temperature: 0.7, maxOutputTokens: 300 },
//   });

//   // Extract text safely
//   const firstCandidate = result.candidates?.[0];
//   text = firstCandidate?.content?.parts
//     ?.map(p => p.text)
//     .filter(Boolean)
//     .join(" ") 
//     || "AI did not return text";

//   console.log("Gemini raw response:", result);
//   console.log("Parsed text:", text);
// }









import type { Request, Response } from "express";
import { initializeAgentClient, getModelConfig, type AgentProvider } from "#agents";
import { GoogleGenAI } from "@google/genai";
import type OpenAI from "openai";

/**
 * Handle AI requests from frontend
 */
export const handleAsk = async (req: Request, res: Response) => {
  try {
    const { prompt, provider } = req.body as { prompt: string; provider?: AgentProvider };

    if (!prompt) {
      return res.status(400).json({ success: false, reason: "Prompt is required" });
    }

    // Initialize client and get model
    const client = initializeAgentClient(provider);
    const model = getModelConfig(provider);

    let aiResponse: string;

    // Handle OpenAI / Ollama via OpenAI SDK
    if (provider === "openai") {
      // @ts-ignore
      const completion = await client.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
      });

      // Some OpenAI responses come as an array
      aiResponse = completion?.choices?.[0]?.message?.content || "No response from AI";

    } 

    if (provider === "ollama") {
        const openAIClient = client as OpenAI;
        const modelName =
            typeof model === "string" ? model : (model as any).model ?? "llama3.1:8b";

        const completion = await openAIClient.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
        });

        aiResponse = completion.choices?.[0]?.message?.content ??"No response from AI";
    }

    
    
    else if (provider === "gemini") {
        //const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const openAIClient = client as GoogleGenAI; 
        const modelName = typeof model === "string" ? model : process.env.GEMINI_MODEL??"models/gemini-2.5-flash";
         let Response = await openAIClient.models.generateContent({
            model: modelName ??'gemini-2.5-flash',
            contents: prompt,
            config: {
            temperature: 0.7,
            maxOutputTokens: 300,
            responseMimeType: 'application/json',
            responseSchema: {
                type: 'object',
                properties: {
                originalPrompt: { type: 'string' },
                generatedResponse: { type: 'string' }
                },
                required: ['originalPrompt', 'generatedResponse']
            }
        }
        });
 
            const firstCandidate = Response.candidates?.[0];
            aiResponse = firstCandidate?.content?.parts
                ?.map(p => p.text)
                .filter(Boolean)
                .join(" ") || "AI did not return text";



    } 
    
    
    else {
      return res.status(400).json({ success: false, reason: "Unknown provider" });
    }

    return res.json({ success: true, response: aiResponse });
  } catch (err: any) {
    console.error("AI error:", err);
    return res.status(500).json({ success: false, reason: err.message || "Server error" });
  }
};
