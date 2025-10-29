





import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI!;
  if (!uri) throw new Error("Missing MONGODB_URI in .env.local");
  await mongoose.connect(uri);
  isConnected = true;
  console.log("✅ MongoDB connected");
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
function createRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}
function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// --------------------------------------------
// POST → signup / login / logout
// --------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userName, email, password } = body;
    await connectDB();

    // -------------------- SIGNUP --------------------
    if (action === "signup") {
      const existing = await User.findOne({ email });
      if (existing)
        return NextResponse.json({ message: "Email already registered" }, { status: 400 });

      const hashed = await bcrypt.hash(password, 10);
      const newUser = await User.create({ userName, email, password: hashed });

      const accessToken = createAccessToken(newUser._id.toString());
      const refreshToken = createRefreshToken(newUser._id.toString());

      const res = NextResponse.json({
        message: "User created successfully",
        user: { id: newUser._id, email: newUser.email },
      });

      res.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60,
      });
      res.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return res;
    }

    // -------------------- LOGIN --------------------
    if (action === "login") {
      const user = await User.findOne({ email });
      if (!user)
        return NextResponse.json({ message: "No user found with this email" }, { status: 400 });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return NextResponse.json({ message: "Invalid password" }, { status: 401 });

      const accessToken = createAccessToken(user._id.toString());
      const refreshToken = createRefreshToken(user._id.toString());

      const res = NextResponse.json({
        message: "Login successful",
        user: { id: user._id, email: user.email, name: user.userName },
      });

      res.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60,
      });
      res.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return res;
    }

    // -------------------- LOGOUT --------------------
    if (action === "logout") {
      const res = NextResponse.json({ message: "Logged out successfully" });
      res.cookies.set("accessToken", "", { httpOnly: true, expires: new Date(0), path: "/" });
      res.cookies.set("refreshToken", "", { httpOnly: true, expires: new Date(0), path: "/" });
      return res;
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Auth error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

// --------------------------------------------
// PATCH → Update account (authenticated)
// --------------------------------------------
export async function PATCH(req: Request) {
  try {
    await connectDB();

    const cookies = req.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ message: "No access token found" }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });

    const { userId } = decoded;
    const body = await req.json();
    const { email, password, userName } = body;

    const updateData: any = {};
    if (email) updateData.email = email;
    if (userName) updateData.userName = userName;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updated)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      message: "Account updated successfully",
      user: { id: updated._id, email: updated.email, name: updated.userName },
    });
  } catch (err: any) {
    console.error("Update error:", err);
    return NextResponse.json({ message: err.message || "Failed to update account" }, { status: 500 });
  }
}

// --------------------------------------------
// DELETE → Delete account (authenticated)
// --------------------------------------------
export async function DELETE(req: Request) {
  try {
    await connectDB();

    const cookies = req.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ message: "No access token found" }, { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded) return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });

    const { userId } = decoded;
    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const res = NextResponse.json({ message: "Account deleted successfully" });
    res.cookies.set("accessToken", "", { httpOnly: true, expires: new Date(0), path: "/" });
    res.cookies.set("refreshToken", "", { httpOnly: true, expires: new Date(0), path: "/" });
    return res;
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json({ message: err.message || "Failed to delete account" }, { status: 500 });
  }
}
