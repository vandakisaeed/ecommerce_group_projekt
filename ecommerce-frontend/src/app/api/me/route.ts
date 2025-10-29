




import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // may be used later if we extend

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");
if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");

// ✅ MongoDB connection (shared)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
  console.log("✅ MongoDB connected (/api/me)");
}

// ✅ User model
const UserSchema = new mongoose.Schema({
  userName: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// ✅ JWT helpers
function createAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}
function verifyToken(token: string, secret: string) {
  try {
    return jwt.verify(token, secret) as { userId: string };
  } catch {
    return null;
  }
}

// ✅ GET → Get current user info
export async function GET(req: Request) {
  try {
    await connectDB();

    const cookies = req.headers.get("cookie");
    if (!cookies)
      return NextResponse.json({ message: "No cookies found" }, { status: 401 });

    const accessToken = cookies
      .split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1];
    const refreshToken = cookies
      .split(";")
      .find((c) => c.trim().startsWith("refreshToken="))
      ?.split("=")[1];

    if (!accessToken && !refreshToken)
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    let decoded = accessToken ? verifyToken(accessToken, JWT_SECRET) : null;
    let newAccessToken = null;

    // If access token expired, try refresh
    if (!decoded && refreshToken) {
      const refreshDecoded = verifyToken(refreshToken, JWT_REFRESH_SECRET);
      if (refreshDecoded) {
        decoded = refreshDecoded;
        newAccessToken = createAccessToken(refreshDecoded.userId);
      }
    }

    if (!decoded)
      return NextResponse.json({ message: "Invalid or expired session" }, { status: 401 });

    const user = await User.findById(decoded.userId).select("userName email");
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const res = NextResponse.json({
      user: { id: user._id, name: user.userName, email: user.email },
    });

    // Refresh token automatically if needed
    if (newAccessToken) {
      res.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60,
      });
    }

    return res;
  } catch (err: any) {
    console.error("Get user (/api/me) error:", err);
    return NextResponse.json({ message: err.message || "Internal error" }, { status: 500 });
  }
}
