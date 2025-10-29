import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

function createAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}

export async function POST() {
  try {
    const refreshToken = cookies().get("refreshToken")?.value;
    if (!refreshToken)
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const accessToken = createAccessToken(decoded.userId);

    const res = NextResponse.json({ message: "Access token refreshed" });
    res.headers.append(
      "Set-Cookie",
      cookie.serialize("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
        path: "/",
      })
    );
    return res;
  } catch (err) {
    console.error("Refresh token invalid:", err);
    return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
  }
}
