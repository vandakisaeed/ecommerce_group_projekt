"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {useAuthStore} from '../login/page'


interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function Nav() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { isLoggedIn } = useAuthStore(); // ✅ get global login state

  // Load cart from localStorage on mount
    useEffect(() => {
      const handleCartUpdate = () => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) setCart(JSON.parse(storedCart));
      };

      // Listen for the custom event
      window.addEventListener("cartUpdated", handleCartUpdate);

      // Run once on mount too
      handleCartUpdate();

      return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, []);


  // Calculate total items and subtotal
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">Home</Link>
        <Link href="/about" className="btn btn-ghost text-xl">About</Link>
        <Link href="/login" className="btn btn-ghost text-xl">Login</Link>
        <Link href="/signup" className="btn btn-ghost text-xl">Signup</Link>
        {/* <Link href="/ai" className="btn btn-ghost text-xl">AI</Link> */}
        {isLoggedIn?(

          <Link href="/dbProducts" className="btn btn-ghost text-xl">Products</Link>
        ):''

        }
      </div>

      <div className="flex-none">
        {/* Cart Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              {/* Cart Icon */}
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-5 w-5"
                   fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor">
                <path strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {/* Item count badge */}
              <span className="badge badge-sm indicator-item">{totalItems}</span>
            </div>
          </div>

          {/* Dropdown content */}
          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-60 shadow">
            <div className="card-body">
              <span className="text-lg font-bold">{totalItems} Items</span>
              <span className="text-info">Subtotal: ${subtotal.toFixed(2)}</span>
              <div className="card-actions">
                <Link href="/cart">
                  <button className="btn btn-primary btn-block">View Cart</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Dropdown */}
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
