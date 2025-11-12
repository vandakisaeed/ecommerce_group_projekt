
import OpenAI from "openai";
import { OpenAIChatCompletionsModel, setDefaultOpenAIClient } from "@openai/agents";
import { GoogleGenAI } from "@google/genai";

export type AgentClient = OpenAI | GoogleGenAI;
export type AgentProvider = "openai" | "gemini" | "ollama";

/**
 * Initialize AI client based on provider
 */
export const initializeAgentClient = (): AgentClient => {

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("✅ Gemini client initialized");
    return client;
  }

/**
 * Get model based on provider
 */
export const getModelConfig = (): string | OpenAIChatCompletionsModel => {

  
    const raw = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    return raw.startsWith("models/") ? raw : `models/${raw}`;
  }

