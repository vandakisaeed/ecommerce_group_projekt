
import { Router } from 'express';
import { ai } from "#controllers";

export const userRouter = Router();

userRouter
  .route('/')
  .get()
  .post(ai);
