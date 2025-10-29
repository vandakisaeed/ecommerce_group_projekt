import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

const router = express.Router();
router.use(cookieParser());

const users = []; // temporary in-memory users
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🧩 Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (users.find((u) => u.email === email))
    return res.status(400).json({ error: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), name, email, password: hashed };
  users.push(newUser);
  res.json({ success: true });
});

// 🧩 Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, user: { id: user.id, name: user.name, email } });
});

// 🧩 Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// 🧩 Me
router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ user: null });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    res.json({ user: user ? { id: user.id, name: user.name, email: user.email } : null });
  } catch {
    res.status(401).json({ user: null });
  }
});

export default router;
