import { Router } from 'express';
import { createCustomerSupportCompletion , handleAsk} from '#controllers';
import { validateBodyZod } from '#middlewares';
import { promptWithProviderSchema } from '#schemas';

export const aiRouter = Router();

// aiRouter
//   .route('/')
//   .post(handleAsk);

  aiRouter
  .route('/')
  .post(validateBodyZod(promptWithProviderSchema), createCustomerSupportCompletion);
