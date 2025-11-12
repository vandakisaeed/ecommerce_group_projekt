/**
 * AGENTS MODULE
 * Central export point for all agent-related functionality
 */

///////////////////// custom srvice
// gemini
export  { runOrchestrator } from './gemini/orchestratorGemini.ts';

// Configuration
export { initializeAgentClient, getModelConfig ,  } from './openai/config.ts';
export type { AgentClient ,AgentProvider} from './openai/config.ts';

// Individual agents
export { customerSupportAgent } from './openai/customerSupportAgent.ts';
export { escalationAgent } from './openai/escalationAgent.ts';
export { salesAgent } from './openai/salesAgent.ts';
export { refundsAgent } from './openai/refundsAgent.ts';
export { guardrailAgent } from './openai/guardrailAgent.ts';
// Main orchestrator
export { orchestratorAgent, InputGuardrailTripwireTriggered } from './openai/orchestratorAgent.ts';

///////////////////// personal trainer

export {fitnessOrchestrator} from './personalTrainer/fitnessOrchestrator.ts'



