import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // optional if Node <18
import { connectDB } from "./db/index";
import { signup, login } from "./controllers/authController";
import { createOrder, getUserOrders, getOrderById, updateOrderToPaid } from "./controllers/orderController";
const app = express();
// Connect to MongoDB
connectDB();
// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Next.js default port
    credentials: true // Enable credentials (cookies, authorization headers)
}));
app.use(express.json());
// Fetch products route
app.get("/products", async (req, res) => {
    try {
        const response = await fetch("https://fakestoreapi.com/products");
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});
// Optional cart route (for add/remove simulation)
let cart = [];
// Auth routes
app.post("/api/auth_server", (req, res) => {
    const { action } = req.body;
    switch (action) {
        case "signup":
            return signup(req, res);
        case "login":
            return login(req, res);
        default:
            return res.status(400).json({ message: "Invalid action" });
    }
});
// Order routes
app.post("/api/orders", createOrder);
app.get("/api/orders/user/:userId", getUserOrders);
app.get("/api/orders/:orderId", getOrderById);
app.put("/api/orders/:orderId/pay", updateOrderToPaid);
app.post("/api/cart", (req, res) => {
    const { product } = req.body;
    const existing = cart.find((item) => item.id === product.id);
    if (existing)
        existing.quantity += 1;
    else
        cart.push({ ...product, quantity: 1 });
    res.json({ success: true, cart });
});
app.delete("/api/cart", (req, res) => {
    const { product } = req.body;
    cart = cart.filter((item) => item.id !== product.id);
    res.json({ success: true, cart });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
