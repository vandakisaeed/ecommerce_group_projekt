import z from 'zod';
import { getModelConfig, type AgentProvider } from '../openai/config';
import { Agent } from '@openai/agents';
import { bmiCalculatorTool, dailyCalorieCalculatorTool, fetchWorkoutPlanTool } from './fitnessNewsTool'; // import your tools

export const trainingPlanAgent = (provider: AgentProvider) =>
  new Agent({
    name: "Training Plan Agent",
    instructions: `
      You are a certified fitness trainer.
      You design personalized workout programs based on user goals.
      
      Tasks:
      - Create beginner, intermediate, or advanced workout plans
      - Recommend weekly routines (split training, cardio days)
      - Give rest & recovery advice
      - Adjust difficulty if requested
      
      Keep your tone encouraging, clear, and motivating.
    `,
    model: getModelConfig(provider),
    tools: [
      bmiCalculatorTool,
      dailyCalorieCalculatorTool,
      fetchWorkoutPlanTool
    ], 
    toolUseBehavior: "stop_on_first_tool"
  });
