/**
 * CUSTOMER SUPPORT COMPLETION CONTROLLER
 * Handles agentic AI flow for customer support using OpenAI Agents SDK
 *
 * This demonstrates the evolution from simple completions → tool calling → agentic workflows
 */
import type { RequestHandler } from 'express';
import type { IncomingPrompt } from '#types';
import { run } from '@openai/agents';
import {} from '@google/genai'
import { orchestratorAgent, initializeAgentClient, InputGuardrailTripwireTriggered } from '#agents';
import {runOrchestrator} from '../agents/gemini/orchestratorGemini'
import { type AgentProvider} from '#agents';
import {fitnessOrchestrator} from '#agents'
// Initialize the agent client on module load
// This sets up the OpenAI client for all agents to use
//[provider, setProvider] = useState<string | undefined>();

/**
 * Response type for customer support endpoint
 */
type CustomerSupportResponse =
  | {
      success: true;
      response: string;
      debug?: string;
    }
  | {
      success: false;
      error: string;
      reason?: string;
    };

/**
 * Controller: Handle customer support requests via agentic AI
 *
 * Flow:
 * 1. Input guardrail checks if query is relevant to our business
 * 2. Orchestrator agent routes to appropriate specialist (sales, refunds, escalation, support)
 * 3. Specialist agent handles the request (may call tools)
 * 4. Structured response returned to user
 */

export const createCustomerSupportCompletion: RequestHandler<
  unknown,
  CustomerSupportResponse,
  IncomingPrompt
> = async (req, res) => {
  const { provider, prompt } = req.body as { prompt: string; provider: AgentProvider };
  
if (provider === 'openai' || provider === 'ollama'){
    try {
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
    console.log(`\x1b[36m🤖 Customer Support Request: "${prompt}"\x1b[0m`);
    console.log(`\x1b[36m🤖 provider: "${provider}"\x1b[0m`);
    console.log('📥 Raw request body:', req.body);
    console.log('📥 Provider type:', typeof provider, provider);
    console.log('📥 Prompt type:', typeof prompt, prompt);
    console.log('after init agent ');
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

    initializeAgentClient(provider);


    //const result = await run(orchestratorAgent(provider), prompt );
    
    const result = await run(fitnessOrchestrator(provider), prompt );

    



    ////////////////////////////////

    console.log(result)
    console.log('\x1b[32m✓ Agent completed successfully\x1b[0m');
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');

    // Return successful response
    res.status(200).json({
      success: true,
      response: result.finalOutput || 'No response generated'
    });
  } catch (error: unknown) {
    // Handle guardrail failures (off-topic queries)
    if (error instanceof InputGuardrailTripwireTriggered) {
      console.log('\x1b[33m⚠️  Guardrail triggered - query not relevant\x1b[0m');
      console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');

      res.status(400).json({
        success: false,
        error:
          'Your question does not appear to be related to CloudPillow Co. products or services.',
        reason: 'guardrail_triggered'
      });
      return;
    }

    // Handle other errors (let global error handler deal with it)
    console.error('\x1b[31m✗ Agent error occurred\x1b[0m');
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: 'Agent processing failed',
      reason: `status=500; body=${message}`,
    });
  }
} else if (provider==='gemini'){
    try {
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
    console.log(`\x1b[36m🤖 Customer Support Request: "${prompt}"\x1b[0m`);
    console.log(`\x1b[36m🤖 provider: "${provider}"\x1b[0m`);
    console.log('📥 Raw request body:', req.body);
    console.log('📥 Provider type:', typeof provider, provider);
    console.log('📥 Prompt type:', typeof prompt, prompt);
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

    initializeAgentClient(provider);

        // For Gemini, run the orchestrator directly

    
    const result = await runOrchestrator(prompt);

    console.log(result)
    console.log('\x1b[32m✓ Agent completed successfully\x1b[0m');
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
  const text = result.response;

    // Return successful response
    res.status(200).json({
      success: true,
      response: text || 'No response generated'
    });
  } catch (error: unknown) {
    // Handle guardrail failures (off-topic queries)
    if (error instanceof InputGuardrailTripwireTriggered) {
      console.log('\x1b[33m⚠️  Guardrail triggered - query not relevant\x1b[0m');
      console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');

      res.status(400).json({
        success: false,
        error:
          'Your question does not appear to be related to CloudPillow Co. products or services.',
        reason: 'guardrail_triggered'
      });
      return;
    }

    // Handle other errors (let global error handler deal with it)
    console.error('\x1b[31m✗ Agent error occurred\x1b[0m');
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: 'Agent processing failed',
      reason: `status=500; body=${message}`,
    });
  }

}

};
