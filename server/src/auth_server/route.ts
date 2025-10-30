import type  { Request, Response } from "express";
import express from "express";

import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "#models"; // adjust path
import { RefreshToken } from "#models"; // adjust path
import { mongoDBConnect } from "../db/index"; // adjust path

const router = express.Router();

// === Connect MongoDB before handling any routes ===
async function initDB() {
  await mongoDBConnect();
}

// === Utility: Create tokens ===
function createTokens(userId: string) {
  const jwtSecret = process.env.JWT_SECRET || "devsecret";
  const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

// ============================================================
// === GET /auth/me  → Verify user by access token
// ============================================================
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const jwtSecret = process.env.JWT_SECRET || "devsecret";
    const payload = jwt.verify(token, jwtSecret) as { userId: string };

    return res.json({ success: true, userId: payload.userId });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

// ============================================================
// === POST /auth  → Login / Signup / Logout (via action)
// ============================================================
router.post("/", async (req: Request, res: Response) => {
  try {
    await initDB();
    const { action } = req.body;

    if (!action) return res.status(400).json({ message: "Missing action (login/signup/logout)" });

    // ===================== SIGNUP =====================
    if (action === "signup") {
      const { userName, email, password } = req.body;

      if (!userName || !email || !password)
        return res.status(400).json({ message: "Username, email, and password required" });

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(409).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({ userName, email, password: hashedPassword });

      const { accessToken, refreshToken } = createTokens(newUser._id as string);
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create({
        userId: newUser._id,
        token: hashedRefreshToken,
        expiresAt,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 min
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        success: true,
        message: "Signup successful",
        user: { _id: newUser._id, userName: newUser.userName, email: newUser.email },
      });
    }

    // ===================== LOGIN =====================
    if (action === "login") {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const user = await User.findOne({ email });
      if (!user || !user.password)
        return res.status(401).json({ message: "Invalid credentials" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(401).json({ message: "Invalid credentials" });

      const { accessToken, refreshToken } = createTokens(user._id as string);
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create({
        userId: user._id,
        token: hashedRefreshToken,
        expiresAt,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Login successful",
        user: { _id: user._id, userName: user.userName, email: user.email },
      });
    }

    // ===================== LOGOUT =====================
    if (action === "logout") {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.json({ message: "Logged out successfully" });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (err: any) {
    console.error("Auth error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// ============================================================
// === PATCH /auth → Update user
// ============================================================
router.patch("/", async (req: Request, res: Response) => {
  await initDB();

  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const jwtSecret = process.env.JWT_SECRET || "devsecret";
  let payload: { userId: string };

  try {
    payload = jwt.verify(token, jwtSecret) as { userId: string };
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const { email, password } = req.body;
  const update: any = {};
  if (email) update.email = email;
  if (password) update.password = await bcrypt.hash(password, 12);

  if (Object.keys(update).length === 0)
    return res.status(400).json({ message: "No update fields provided" });

  const updatedUser = await User.findByIdAndUpdate(payload.userId, update, { new: true });
  if (!updatedUser) return res.status(404).json({ message: "User not found" });

  return res.json({
    user: {
      _id: updatedUser._id,
      userName: updatedUser.userName,
      email: updatedUser.email,
    },
  });
});

// ============================================================
// === DELETE /auth → Remove refresh token (logout backend)
// ============================================================
router.delete("/", async (req: Request, res: Response) => {
  await initDB();

  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    const jwtSecret = process.env.JWT_SECRET || "devsecret";
    try {
      const payload = jwt.verify(refreshToken, jwtSecret) as { userId: string };
      const tokenDocs = await RefreshToken.find({ userId: payload.userId });

      for (const tokenDoc of tokenDocs) {
        const match = await bcrypt.compare(refreshToken, tokenDoc.token);
        if (match) {
          await RefreshToken.deleteOne({ _id: tokenDoc._id });
          break;
        }
      }
    } catch (err) {
      console.error("Error deleting token:", err);
    }
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out successfully" });
});

export default router;
