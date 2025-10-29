




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

  // ✅ Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:4000/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // ✅ Load cart from backend or localStorage
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("http://localhost:4000/api/cart");
        const data = await res.json();
        setCart(data);
        localStorage.setItem("cart", JSON.stringify(data));
      } catch {
        const stored = localStorage.getItem("cart");
        if (stored) setCart(JSON.parse(stored));
      }
    }
    fetchCart();
  }, []);

  // ✅ Add to cart
  const addToCart = async (product: Product) => {
    try {
      const res = await fetch("http://localhost:4000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      setCart(data.cart);
      localStorage.setItem("cart", JSON.stringify(data.cart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  if (loading)
    return <div className="text-center py-20 text-lg">Loading products...</div>;

  return (
    <div className="px-6 py-10 bg-base-100">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to TechStore 🛍️</h1>
        <p className="text-lg text-gray-500 mb-6">
          Discover the latest gadgets and accessories at unbeatable prices.
        </p>
      </section>

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
              <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
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


