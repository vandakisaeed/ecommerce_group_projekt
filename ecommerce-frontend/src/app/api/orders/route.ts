
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db"; // ✅ FIXED import path
import Order from "@/models/ordersModel";
import { getUserFromRequest } from "@/utils/auth"; // optional helper



export async function POST(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = await req.json();

    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: user._id,
      items,
      total,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}
