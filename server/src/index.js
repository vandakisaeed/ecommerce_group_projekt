import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // skip this import if Node >=18

const app = express();
app.use(cors());
app.use(express.json());

let cart = [];

// ✅ Fetch products from FakeStore API
app.get("/products", async (req, res) => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ Return the current cart
app.get("/api/cart", (req, res) => {
  res.json(cart);
});

// ✅ Add to cart
app.post("/api/cart", (req, res) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ error: "Missing product" });

  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });

  res.json({ success: true, cart });
});

// ✅ Remove from cart
app.delete("/api/cart", (req, res) => {
  const { product } = req.body;
  if (!product?.id) return res.status(400).json({ error: "Missing product id" });

  cart = cart.filter((item) => item.id !== product.id);
  res.json({ success: true, cart });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
