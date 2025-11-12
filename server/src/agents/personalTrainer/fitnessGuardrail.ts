
import { getModelConfig , type AgentProvider} from '../openai/config';
import { Agent, tool } from '@openai/agents';




export const guardrailAgent = (provider: AgentProvider) =>
  new Agent({
    name: "Fitness Guardrail Agent",
    instructions: `
      You are a guardrail that determines whether the user's query 
      is relevant to fitness, exercise, nutrition, or health training.

      Mark as irrelevant if the query is about unrelated topics
      (politics, code, math, entertainment, etc.).
    `,
    model: getModelConfig(provider),
  });
