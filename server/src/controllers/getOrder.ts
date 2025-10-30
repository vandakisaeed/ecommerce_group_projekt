import type { Request, Response } from "express";
import { Order } from "../models/ordersModel";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID missing" });
    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: "No order items" });

    const fixedOrderItems = orderItems.map((item: any) => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      product: item.product || item._id || item.id || item.productId,
    }));

    const order = new Order({
      user: userId,
      orderItems: fixedOrderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const created = await order.save();
    res.status(201).json(created);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
