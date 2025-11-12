import { Agent, handoff, type InputGuardrail, run } from '@openai/agents';

import { getModelConfig , type AgentProvider} from '../openai/config';
import {trainingPlanAgent} from './trainingPlanAgent'
import {dietAgent} from './dietAgent'
import {equipmentAgent} from './equipmentAgent'
import {escalationAgent} from './escalationAgent'
import {guardrailAgent} from './fitnessGuardrail'

const pillowGuardrail=(provider : AgentProvider): InputGuardrail =>( {
  name: 'CloudPillow Intent Guardrail',
  execute: async ({ input, context }) => {
    try{
    const guardrail = guardrailAgent(provider );
    const result = await run(guardrail, input, { context });
          console.log("🧠 Guardrail result:", result.output);

      const output = result.output as { isRelevant?: boolean };

      return {
        outputInfo: output,
        tripwireTriggered: !(output?.isRelevant ?? true),
      }
    } catch (error) {
      console.error("❌ Guardrail execution failed:", error);
      return {
        outputInfo: { error: String(error) },
        tripwireTriggered: false, // default to allow if guardrail fails
      };
  }
}
});




export const fitnessOrchestrator = (provider: AgentProvider) =>
  new Agent({
    name: "Fitness Orchestrator Agent",
    instructions: `
      You are the triage agent for a Personal Trainer AI system.

      Your ONLY job:
      - Decide which specialized agent should handle the user's query.

      Routing rules:
      - If the user asks about workouts, exercises, or training → Training Plan Agent
      - If about food, meals, calories, or nutrition → Diet Agent
      - If about buying or choosing fitness equipment → Equipment Agent
      - If the user is angry, frustrated, or complains → Escalation Agent
      - Otherwise → Training Plan Agent (default)
    `,
    model: getModelConfig(provider),
    inputGuardrails: [pillowGuardrail(provider)],
    handoffs: [
      trainingPlanAgent(provider),
      dietAgent(provider),
      equipmentAgent(provider),
      escalationAgent(provider),
    ],
  });

