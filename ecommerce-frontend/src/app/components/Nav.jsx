"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Nav() {
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  };
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
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
    window.addEventListener('profileUpdated', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('profileUpdated', loadUser);
    };
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

    // Listen for storage events (other tabs) and custom cart updates in same tab
    window.addEventListener('storage', loadCart);
    window.addEventListener('cartUpdated', loadCart);
    return () => {
      window.removeEventListener('storage', loadCart);
      window.removeEventListener('cartUpdated', loadCart);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
    router.push("/login");
  };

  return (
  <div className="navbar bg-base-100 shadow-lg backdrop-blur-md bg-opacity-80 transition-all duration-300 rounded-xl mx-2 mt-2">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-extrabold tracking-tight">Buy Buy Beyond</Link>
      </div>
      <div className="flex-none flex items-center gap-2">
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
        {user && (
          <Link href="/orders" className="btn btn-ghost">Orders</Link>
        )}
        
        <button
          className="btn btn-circle btn-ghost"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            // Updated light-mode icon shown while in dark mode (sun with rays)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {/* Sun core */}
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
              {/* Rays */}
              <path strokeLinecap="round" strokeWidth="2" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            // Updated dark-mode icon shown while in light mode (moon + tiny star)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {/* Crescent moon */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.35A8.65 8.65 0 1111.65 3 6.5 6.5 0 0021 12.35z" />
              {/* Small star */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 6l.35-1.05L18.2 6l1.05.35L18.2 6.7l-.35 1.05L17.5 6.7l-1.05-.35L17.5 6z" />
            </svg>
          )}
        </button>
        {!user ? (
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-ghost">Login</Link>
            <Link href="/signup" className="btn btn-ghost">Signup</Link>
          </div>
        ) : (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full overflow-hidden border-2 border-primary shadow">
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
                <Link href="/profile" className="justify-between">
                  Profile
                </Link>
              </li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}