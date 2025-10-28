"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from '../config/api';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Main() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Express backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(api.endpoints.products);
        const data = await res.json();
        // Defensive: ensure the response is an array before setting products
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray((data as { products?: Product[] }).products)) {
          setProducts((data as { products?: Product[] }).products || []);
        } else {
          console.error('Unexpected products response shape:', data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Add to cart
  const addToCart = async (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const newCart = [...prevCart, { ...product, quantity: 1 }];
      // Save cart to localStorage and notify other parts of the app
      localStorage.setItem('cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cartUpdated'));
      return newCart;
    });

    try {
      await fetch(api.endpoints.cart, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ product }),
      });
    } catch (err) {
      console.error("Failed to sync cart:", err);
    }
  };

  // Remove from cart
  const removeFromCart = async (id: number) => {
    setCart((prevCart) => {
      const updated = prevCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cartUpdated'));
      return updated;
    });

    try {
      await fetch("http://localhost:4000/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync cart:", err);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="text-center py-20 text-lg">Loading products...</div>;

  return (
    <div className="px-6 py-10 bg-base-100">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to Buy Buy Beyond 🛍️</h1>
        <p className="text-lg text-gray-500 mb-6">
          Discover the latest gadgets and accessories at unbeatable prices.
        </p>
      </section>

      <section className="bg-base-200 p-4 rounded-xl shadow mb-10">
        <h2 className="text-2xl font-semibold mb-4">🛒 Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-3 mb-4">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-xs btn-outline" onClick={() => removeFromCart(item.id)}>
                      -
                    </button>
                    <button className="btn btn-xs btn-primary" onClick={() => addToCart(item)}>
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-lg font-semibold mb-4">Total: ${totalPrice.toFixed(2)}</p>
            <Link href="/checkout" className="btn btn-primary w-full">
              Proceed to Checkout
            </Link>
          </>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="card bg-base-200 shadow-xl hover:shadow-2xl transition"
          >
            <figure className="relative w-full h-48 p-4">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 25vw"
              />
            </figure>
            <div className="card-body text-center">
              <h2 className="card-title justify-center">{product.title}</h2>
              <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
              <div className="card-actions justify-center">
                <button className="btn btn-accent btn-sm" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
