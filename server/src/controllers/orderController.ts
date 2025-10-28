import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/ordersModel';
import User from '../models/usersModel';
import { Error } from 'mongoose';

interface ValidationError extends Error.ValidationError {
  errors: {
    [key: string]: Error.ValidatorError;
  };
}

interface CastError extends Error.CastError {
  value: any;
  path: string;
  message: string;
}

interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string | number;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { 
      userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice 
    } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate order items
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Validate required fields in shipping address
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: 'Please provide complete shipping address' });
    }

    // Map orderItems to use the external product ID as a string
    const mappedOrderItems = orderItems.map((item: OrderItem) => ({
      ...item,
      product: `external_${item.product}` // Prefix external IDs to distinguish them
    }));

    // Create the order with mapped items
    const order = await Order.create({
      user: userId,
      orderItems: mappedOrderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    
    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      const messages = Object.values(validationError.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Invalid order data', 
        details: messages 
      });
    }
    
    // Handle invalid ObjectId errors
    if (error instanceof Error && error.name === 'CastError') {
      const castError = error as CastError;
      return res.status(400).json({ 
        message: 'Invalid ID format',
        details: castError.message 
      });
    }
    
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ 
      message: 'Error creating order',
      details: message 
    });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 }) // Most recent first
      .populate('user', 'userName email'); // Include user details

    res.json(orders);
  } catch (error: unknown) {
    console.error('Get user orders error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ 
      message: 'Error fetching orders',
      details: message 
    });
  }
};

// Get single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Validate orderId to avoid CastError when it's undefined or not a valid ObjectId
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(orderId).populate('user', 'userName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error: unknown) {
    console.error('Get order error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ 
      message: 'Error fetching order',
      details: message 
    });
  }
};

// Update order to paid
export const updateOrderToPaid = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentResult } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = paymentResult;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: unknown) {
    console.error('Update order error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ 
      message: 'Error updating order',
      details: message 
    });
  }
};