import { NextResponse } from "next/server";

export async function GET() {
  try {
    // You can replace this with a real DB call later
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
