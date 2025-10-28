"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Nav() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id) {
            setUser(parsedUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setUser(null);
      }
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const cart = JSON.parse(storedCart);
          const count = cart.reduce((sum, item) => sum + item.quantity, 0);
          const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          setCartCount(count);
          setCartTotal(total);
        } else {
          setCartCount(0);
          setCartTotal(0);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setCartCount(0);
        setCartTotal(0);
      }
    };
    loadCart();

    // Listen for storage events to update cart when it changes
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">Home</Link>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="badge badge-sm indicator-item">{cartCount}</span>
              )}
            </div>
          </div>
          <div tabIndex={0} className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow">
            <div className="card-body">
              <span className="text-lg font-bold">{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</span>
              <span className="text-info">Subtotal: ${cartTotal.toFixed(2)}</span>
              <div className="card-actions">
                <Link href="/cart"><button className="btn btn-primary btn-block">View cart</button></Link>
              </div>
            </div>
          </div>
        </div>
        
        {!user ? (
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-ghost">Login</Link>
            <Link href="/signup" className="btn btn-ghost">Signup</Link>
          </div>
        ) : (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full overflow-hidden">
                <Image
                  alt="User avatar"
                  src={user.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  width={40}
                  height={40}
                />
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li><a>Settings</a></li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}