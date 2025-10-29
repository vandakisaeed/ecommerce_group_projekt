






"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Normalize different possible cart shapes into an array of items
  const normalizeCart = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    if (typeof raw === "object" && raw !== null) {
      // Case: { items: [...] }
      if (Array.isArray(raw.items)) return raw.items;

      // Case: { "productId": { id, price, quantity }, ... }
      const values = Object.values(raw);
      const itemLike = values.filter(
        (v) => v && typeof v === "object" && ("quantity" in v || "price" in v)
      );
      if (itemLike.length > 0) return itemLike;
    }

    // fallback
    return [];
  };

  const loadCart = () => {
    try {
      const stored = localStorage.getItem("cart");
      if (!stored) {
        setCartCount(0);
        setCartTotal(0);
        return;
      }

      const parsed = JSON.parse(stored);
      const cart = normalizeCart(parsed);

      const count = cart.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      );
      const total = cart.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      );

      setCartCount(count);
      setCartTotal(total || 0);
    } catch (err) {
      // If parse fails or something unexpected, fallback safely
      // Useful during development if localStorage contains bad data
      console.warn("Failed to load cart from localStorage:", err);
      setCartCount(0);
      setCartTotal(0);
    }
  };

  useEffect(() => {
    // initial load
    loadCart();

    // cross-tab updates
    const onStorage = (e) => {
      if (e.key === "cart") loadCart();
    };
    window.addEventListener("storage", onStorage);

    // same-tab updates (we'll trigger this event from addToCart/removeFromCart)
    const onCartUpdated = () => loadCart();
    window.addEventListener("cartUpdated", onCartUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdated", onCartUpdated);
    };
  }, []);

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          Home
        </Link>
        <Link href="/about" className="btn btn-ghost text-xl">
          About
        </Link>
        <Link href="/login" className="btn btn-ghost text-xl">
          Login
        </Link>
        <Link href="/signup" className="btn btn-ghost text-xl">
          Signup
        </Link>
      </div>

      <div className="flex-none">
        {/* Cart dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              {cartCount > 0 && (
                <span className="badge badge-sm indicator-item">{cartCount}</span>
              )}
            </div>
          </div>

          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 z-10 mt-3 w-56 shadow"
          >
            <div className="card-body">
              <span className="text-lg font-bold">
                {cartCount} {cartCount === 1 ? "Item" : "Items"}
              </span>
              <span className="text-info">Subtotal: ${cartTotal.toFixed(2)}</span>
              <div className="card-actions">
                <Link href="/cart">
                  <button className="btn btn-primary btn-block">View cart</button>
                </Link>
              </div>
            </div>
          </div>
        </div>


        {/* Avatar */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
