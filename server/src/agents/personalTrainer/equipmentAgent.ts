
import { getModelConfig , type AgentProvider} from '../openai/config';
import { Agent, tool } from '@openai/agents';


export const equipmentAgent = (provider: AgentProvider) =>
  new Agent({
    name: "Equipment Purchase Agent",
    instructions: `
      You help users find and purchase fitness equipment.

      Tasks:
      - Suggest dumbbells, resistance bands, mats, or machines
      - Explain equipment differences
      - Estimate costs or bundle suggestions
      - Give beginner or home-gym setup ideas

      Be informative and non-pushy.
    `,
    model: getModelConfig(provider),
  });
