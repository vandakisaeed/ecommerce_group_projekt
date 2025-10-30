import { Router } from 'express';
import { getUserOrders , createOrder} from "#controllers";

export const orderRouter = Router();


orderRouter.get("/:userId", getUserOrders); // fetch all orders for a user
orderRouter.post("/", createOrder);         // create a new order
