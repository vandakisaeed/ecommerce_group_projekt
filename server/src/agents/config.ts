
import OpenAI from "openai";
import { OpenAIChatCompletionsModel, setDefaultOpenAIClient } from "@openai/agents";
import { GoogleGenAI } from "@google/genai";

export type AgentClient = OpenAI | GoogleGenAI;
export type AgentProvider = "openai" | "gemini" | "ollama";

/**
 * Initialize AI client based on provider
 */
export const initializeAgentClient = (provider?: AgentProvider): AgentClient => {
  const envProvider = provider || (process.env.AGENT_PROVIDER as AgentProvider) || "openai";

  if (envProvider === "ollama") {
    const client = new OpenAI({
      apiKey: process.env.OLLAMA_API_KEY || "ollama",
      baseURL: process.env.OLLAMA_URL,
    }) as any;
    setDefaultOpenAIClient(client);
    return client;
  }

  if (envProvider === "openai") {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) as any;
    setDefaultOpenAIClient(client);
    return client;
  }

  if (envProvider === "gemini") {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("✅ Gemini client initialized");
    return client;
  }

  // Fallback
  const fallback = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) as any;
  setDefaultOpenAIClient(fallback);
  return fallback;
};

/**
 * Get model based on provider
 */
export const getModelConfig = (provider?: AgentProvider): string | OpenAIChatCompletionsModel => {
  const envProvider = provider || (process.env.AGENT_PROVIDER as AgentProvider) || "openai";

  if (envProvider === "ollama") {
    const client = new OpenAI({
      apiKey: process.env.OLLAMA_API_KEY || "ollama",
      baseURL: process.env.OLLAMA_URL,
    }) as any;
    return new OpenAIChatCompletionsModel(client, process.env.OLLAMA_MODEL || "llama3.1:8b") ;
  }

  if (envProvider === "gemini") {
    const raw = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    return raw.startsWith("models/") ? raw : `models/${raw}`;
  }

  return process.env.OPENAI_MODEL || "gpt-4o-mini";
};


// export const getModelConfig = (provider?: AgentProvider): string | OpenAIChatCompletionsModel => {
//   const envProvider = provider || (process.env.AGENT_PROVIDER as AgentProvider) || "openai";
//     console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
//     console.log('📥 Provider type:', typeof provider, provider);
//     console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

//   if (envProvider === "ollama") {
//     const client = new OpenAI({
//       apiKey: process.env.OLLAMA_API_KEY || "ollama",
//       baseURL: process.env.OLLAMA_URL,
//     }) as any;
//     return new OpenAIChatCompletionsModel(client, process.env.OLLAMA_MODEL || "llama3.1:8b");
//   }

//   if (envProvider === "gemini") {
//     const raw = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
//     return raw.startsWith("models/") ? raw : `models/${raw}`;
//   }

//   return process.env.OPENAI_MODEL || "gpt-4o-mini";
// };
