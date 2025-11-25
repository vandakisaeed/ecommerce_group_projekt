import z from 'zod';
import { GoogleGenAI, Type } from "@google/genai";
import { getModelConfig  } from "./configGemini.ts";

import { bmiCalculatorTool, dailyCalorieCalculatorTool, fetchWorkoutPlanTool } from '../personalTrainer/fitnessNewsTool'; // import your tools

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function fitnessAgentGemini(query: string) {
  const modelai = getModelConfig()
  const systemInstructions = `
You are a certified fitness trainer.
      You design personalized workout programs or diet programs based on user goals.
      
      Tasks:
      - Create beginner, intermediate, or advanced workout plans
      - Recommend weekly routines (split training, cardio days)
      - Give rest & recovery advice
      - Adjust difficulty if requested
      - plan a daily or weekly diet
      - calculate the calories or bmi
      - suggest the low calories food or low fat
      
      Keep your tone encouraging, clear, and motivating.

Return your answer ONLY in JSON format:
{
  "response": "text answer to the customer",
  "product": "Fitness Dream" | "SkyFit" | "SpeedFit" | "all"
}
`;

  try {
    const result = await ai.models.generateContent({
      model: modelai as string,
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
    //   tools: [
    //   bmiCalculatorTool,
    //   dailyCalorieCalculatorTool,
    //   fetchWorkoutPlanTool
    // ], 
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            product: {
              type: Type.STRING,
              enum: ["Fitness Dream", "SkyFit", "SpeedFit", "all"],
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
    console.error("❌ fitness Agent (Gemini) Error:", error);
    return {
      success: false,
      response:
        "Sorry, I couldn't process your sales query. Please try again.",
      product: "all",
    };
  }
}