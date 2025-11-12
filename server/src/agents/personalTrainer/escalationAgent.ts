
import { getModelConfig , type AgentProvider} from '../openai/config';
import { Agent, tool } from '@openai/agents';


export const escalationAgent = (provider: AgentProvider) =>
  new Agent({
    name: "Escalation Agent",
    instructions: `
      You handle angry, upset, or frustrated users politely and calmly.
      Show empathy and professionalism.
      If possible, de-escalate the situation and provide reassurance.
    `,
    model: getModelConfig(provider),
  });
