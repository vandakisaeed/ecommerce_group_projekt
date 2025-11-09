// // /**

// //  * AGENT CONFIGURATION
// //  * Centralizes model configuration for all agents
// //  * Supports both local (Ollama) and cloud (OpenAI) models
// //  */
// // import OpenAI from 'openai';
// // import { OpenAIChatCompletionsModel, setDefaultOpenAIClient } from '@openai/agents';

// // /**
// //  * Initialize and configure the OpenAI client for agents
// //  * Points to Ollama in development, OpenAI in production
// //  *
// //  * IMPORTANT: Call this ONCE before creating any agents
// //  */
// // export const initializeAgentClient = () => {
// //   const client = new OpenAI({
// //     apiKey:
// //       process.env.NODE_ENV === 'development'
// //         ? process.env.OLLAMA_API_KEY || 'ollama'
// //         : process.env.OPENAI_API_KEY,
// //     baseURL: process.env.NODE_ENV === 'development' ? process.env.OLLAMA_URL : undefined
// //   }) as any; // Type assertion needed due to package version mismatch

// //   // Set as default client for all agents
// //   setDefaultOpenAIClient(client);

// //   return client;
// // };

// // /**
// //  * Get the appropriate model name based on environment
// //  * Returns model string that works with the configured client
// //  */
// // export const getModelConfig = (): OpenAIChatCompletionsModel | string => {
// //   if (process.env.NODE_ENV === 'development') {
// //     // Use chat.completions on local OpenAI-compatible servers (e.g., Ollama/LM Studio)
// //     const client = new OpenAI({
// //       apiKey: process.env.OLLAMA_API_KEY || 'ollama',
// //       baseURL: process.env.OLLAMA_URL
// //     }) as any;
// //     return new OpenAIChatCompletionsModel(client, process.env.OLLAMA_MODEL || 'llama3.1:8b');
// //   }
// //   // Production: use OpenAI cloud models via Responses API
// //   return process.env.OPENAI_MODEL || 'gpt-4o-mini';
// // };


// // src/agent-config.ts
// /**
//  * AGENT CONFIGURATION
//  * Centralizes model configuration for all agents
//  * Supports: Local (Ollama), OpenAI cloud, Gemini (Google LLM)
//  */
// // src/agent-config.ts
// /**
//  * AGENT CONFIGURATION
//  * Centralizes model configuration for all agents
//  * Supports: Local (Ollama), OpenAI cloud, Gemini (Google LLM)
//  */

// import OpenAI from "openai";
// import { OpenAIChatCompletionsModel, setDefaultOpenAIClient } from "@openai/agents";
// import { GoogleGenAI } from "@google/genai"; // ✅ Correct package name

// export type AgentClient = OpenAI | GoogleGenAI;

// /**
//  * Enum for agent providers
//  */
// export type AgentProvider = "openai" | "gemini" | "ollama";

// /**
//  * Initialize the client based on provider
//  */
// export const initializeAgentClient = (provider?: AgentProvider) => {
//   const envProvider = provider || (process.env.AGENT_PROVIDER as AgentProvider) || "openai";
//  console.log(envProvider)
//   // OpenAI-compatible clients are registered with the agents SDK so agent
//   // implementations can use them. For Gemini we return the GenAI client but
//   // do not set it as the default OpenAI client (they are incompatible).
//   if (envProvider === "ollama") {
//     const client = new OpenAI({
//       apiKey: process.env.OLLAMA_API_KEY || "ollama",
//       baseURL: process.env.OLLAMA_URL,
//     }) as any;
//     setDefaultOpenAIClient(client);
//     return client;
//   }

//   if (envProvider === "openai") {
//     const client = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     }) as any;
//     setDefaultOpenAIClient(client);
//     return client;
//   }

// // Gemini (Google) client
// if (envProvider === "gemini") {
//     // Gemini client
//     const client = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API_KEY,
//     });
//     console.log("✅ Gemini client initialized");
//     return client;
//   }

//   // Fallback to OpenAI client
//   const fallback = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) as any;
//   setDefaultOpenAIClient(fallback);
//   return fallback;
// };

// /**
//  * Get the model to use based on environment/provider
//  */
// export const getModelConfig = (provider?: AgentProvider): string | OpenAIChatCompletionsModel => {
//   const envProvider = provider || (process.env.AGENT_PROVIDER as AgentProvider) || "openai";

//   if (envProvider === "ollama") {
//     const client = new OpenAI({ apiKey: process.env.OLLAMA_API_KEY || "ollama", baseURL: process.env.OLLAMA_URL }) as any;
//     return new OpenAIChatCompletionsModel(client, process.env.OLLAMA_MODEL || "llama3.1:8b");
//   }

//   if (envProvider === "gemini") {
//     // getModelConfig should return a model identifier compatible with
//     // the Google Generative API. The API expects model names like
//     // `models/text-bison-001` or `models/chat-bison-001` (including the
//     // "models/" prefix). Accept either form in the env var and
//     // normalize to include the prefix.
//     // Prefer a Gemini model that supports `generateContent` on modern Gen AI API
//     // (many projects have Gemini 2.5/Flash available). If the user set GEMINI_MODEL
//     // use that, otherwise default to a common 'gemini-2.5-flash' identifier.
//     const raw = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
//     return raw.startsWith("models/") ? raw : `models/${raw}`;
//   }

//   // default/openai
//   return process.env.OPENAI_MODEL || "gpt-4o-mini";
// };
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
    return new OpenAIChatCompletionsModel(client, process.env.OLLAMA_MODEL || "llama3.1:8b");
  }

  if (envProvider === "gemini") {
    const raw = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    return raw.startsWith("models/") ? raw : `models/${raw}`;
  }

  return process.env.OPENAI_MODEL || "gpt-4o-mini";
};
