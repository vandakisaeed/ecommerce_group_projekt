// testSalesAgent.ts
import { salesAgent, initializeAgentClient } from '#agents';
import { run } from '@openai/agents';
import type { AgentProvider } from '#agents';

async function testSales() {
  const provider: AgentProvider = 'ollama'; // or 'gemini'
  const prompt = "I want to know the discount for buying 10 pillows";

  // Initialize provider client
  initializeAgentClient(provider);

  try {
    console.log('--- Step 1: Creating Sales Agent ---');
    const agent = salesAgent(provider);
    console.log('Sales Agent initialized:', agent.name);

    console.log('--- Step 2: Running Sales Agent ---');
    const result = await run(agent, prompt);

    console.log('--- Step 3: Agent output ---');
    console.log(result);
    console.log('Final output:', result.finalOutput);

  } catch (error: unknown) {
    console.error('Sales Agent run failed:', error);
  }
}

testSales();
