import express from "express";
import { Order } from "../models/ordersModel";
import { User } from "../models/usersModel";

const router = express.Router();

/**
 * POST /api/orders
 * Creates a new order for a logged-in user
 */
router.post("/", async (req, res) => {
  try {
    const { userId, items, total } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are missing or invalid." });
    }

    const newOrder = new Order({
      userId,
      items,
      total,
      status: "pending",
    });

    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /api/orders/:userId
 * Fetch all orders for a specific user
 */
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
