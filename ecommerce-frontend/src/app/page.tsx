"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/main_server"); // Fetch from your internal API
        const data = await res.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Add product to cart (also sync with server-side cart)
  const addToCart = async (product: Product) => {
    // optimistic UI update
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        // Increment quantity
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Add new item
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    try {
      await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: { id: product.id, title: product.title, price: product.price, image: product.image } }),
      });
    } catch (err) {
      console.error("Failed to add to server cart:", err);
      // optionally, you could roll back optimistic update here
    }
  };

  // Remove one quantity or remove item
  const removeFromCart = async(id: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );

    try {
      await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: { id: id } }),
      });
    } catch (err) {
      console.error("Failed to add to server cart:", err);
      // optionally, you could roll back optimistic update here
    }
  };

  // Calculate total
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="text-center py-20 text-lg">Loading products...</div>
    );
  }

  return (
    <div className="px-6 py-10 bg-base-100">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to TechStore 🛍️</h1>
        <p className="text-lg text-gray-500 mb-6">
          Discover the latest gadgets and accessories at unbeatable prices.
        </p>
      </section>

      {/* Cart Section */}
      <section className="bg-base-200 p-4 rounded-xl shadow mb-10">
        <h2 className="text-2xl font-semibold mb-4">🛒 Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-3 mb-4">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-lg font-semibold">
              Total: ${totalPrice.toFixed(2)}
            </p>
          </>
        )}
      </section>

      {/* Products Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="card bg-base-200 shadow-xl hover:shadow-2xl transition"
          >
            <figure>
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-contain p-4"
              />
            </figure>
            <div className="card-body text-center">
              <h2 className="card-title justify-center">{product.title}</h2>
              <p className="text-lg font-semibold">
                ${product.price.toFixed(2)}
              </p>
              <div className="card-actions justify-center">
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => addToCart(product)}
                >
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
