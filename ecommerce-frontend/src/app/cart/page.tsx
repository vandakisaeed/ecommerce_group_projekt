







"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react"; // 🗑️ icon
import useAuth from "@/hooks/useAuth";

interface CartItem {
  id: number;
  title: string;
  price: number | string;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  // Normalize cart data from localStorage
  const normalizeCart = (data: any): CartItem[] => {
    if (!data) return [];
    let arr: any[] = [];
    if (Array.isArray(data)) arr = data;
    else if (typeof data === "object" && data !== null) {
      if (Array.isArray(data.items)) arr = data.items;
      else arr = Object.values(data);
    }

    return arr
      .filter((v) => v && typeof v === "object" && "id" in v)
      .map((v: any) => ({
        id: Number(v.id) || 0,
        title: v.title || "Untitled Product",
        price: Number(v.price) || 0,
        image: v.image || "/placeholder.png",
        quantity: Number(v.quantity) || 1,
      }));
  };

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      const parsed = stored ? JSON.parse(stored) : [];
      setCart(normalizeCart(parsed));
    } catch (err) {
      console.warn("Failed to parse cart:", err);
      setCart([]);
    }
  }, []);

  // 🔥 Remove item from cart (UI + localStorage + backend)
  const removeItem = async (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    try {
      await fetch("http://localhost:4000/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync cart removal:", err);
    }

    // Let navbar or other components know cart changed
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0)
    : 0;

  const handleCheckout = async () => {
    if (!user) {
      alert("Please sign up or log in to proceed with checkout.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          total,
        }),
      });

      if (!res.ok) throw new Error("Checkout failed");

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      alert("✅ Order placed successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("❌ Failed to place order");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">🛒 Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-base-200 rounded-xl shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p>${(Number(item.price) || 0).toFixed(2)}</p>
                    <p>Qty: {item.quantity}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <p className="font-bold">
                    ${((Number(item.price) || 0) * (item.quantity || 0)).toFixed(2)}
                  </p>

                  {/* 🗑️ Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-error btn-sm flex items-center gap-1"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-right">
            <h2 className="text-2xl font-bold">Total: ${total.toFixed(2)}</h2>
            <button
              onClick={handleCheckout}
              className="btn btn-primary mt-4 text-lg"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
