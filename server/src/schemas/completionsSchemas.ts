// Zod schemas for request validation
import { z } from 'zod';

/**
 * Schema for AI prompt requests
 * Validates that requests have:
 * - prompt: string (1-1000 characters)
 */
export const promptBodySchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(1000, 'Prompt cannot exceed 1000 characters')
});

// Extended schema that allows selecting provider from frontend
export const promptWithProviderSchema = promptBodySchema.extend({
  provider: z.enum(['openai', 'gemini', 'ollama']).optional(),
});