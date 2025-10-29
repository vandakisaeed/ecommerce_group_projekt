import express, { Request, Response } from "express";
import Order from "../models/ordersModel";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/orders - Create new order
router.post("/", authenticateUser, async (req: any, res: Response) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items,
      total,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error creating order" });
  }
});

// (Optional) GET /api/orders - get user’s orders
router.get("/", authenticateUser, async (req: any, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

export default router;
