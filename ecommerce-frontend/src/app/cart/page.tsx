"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import isLoggedIn from '../login/page'
import {useAuthStore} from '../login/page'
interface CartItem {
  productId: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}



export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isLoggedIn } = useAuthStore(); // ✅ get global login state

  const router = useRouter();
  const handleCheckout = () => {
    if (!isLoggedIn) router.push("/login");
    else router.push("/pay");
  };


  // Load cart from localStorage on mount
    useEffect(() => {
      const handleCartUpdate = () => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) setCart(JSON.parse(storedCart));
         setLoading(false);
      };

      // Listen for the custom event
      window.addEventListener("cartUpdated", handleCartUpdate);

      // Run once on mount too
      handleCartUpdate();

      return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, []);

  // Update quantity
  const updateQuantity = async (productId: number, delta: number) => {
    try {
      const item = cart.find((c) => c.productId === productId);
      if (!item) return;

      if (item.quantity + delta <= 0) {
        // Remove item
        await fetch("/api/cart", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setCart((prev) => prev.filter((c) => c.productId !== productId));
      } else {
        // Add/remove quantity
        // send product with `id` field (server accepts id or productId)
        await fetch("/api/cart", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: {
              id: item.productId,
              productId: item.productId,
              title: item.title,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
            },
          }),
        });
        setCart((prev) =>
          prev.map((c) =>
            c.productId === productId ? { ...c, quantity: c.quantity + delta } : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="text-center py-20">Loading cart...</div>;

  if (cart.length === 0)
    return <div className="text-center py-20 text-lg">Your cart is empty.</div>;

  return (
    <div className="px-6 py-10">
      <h1 className="text-4xl font-bold mb-6">Your Shopping Cart 🛒</h1>

      <ul className="space-y-4">
        {cart.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between bg-base-200 p-4 rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.title} className="w-20 h-20 object-contain" />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-gray-500">${item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-xs btn-outline"
                onClick={() => updateQuantity(item.productId, -1)}
              >
                -
              </button>
              <span className="px-2">{item.quantity}</span>
              <button
                className="btn btn-xs btn-primary"
                onClick={() => updateQuantity(item.productId, 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-right">
        <p className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</p>
        <button className="btn btn-success mt-4" onClick={handleCheckout}>Proceed to Checkout</button>
      </div>
    </div>
  );
}
