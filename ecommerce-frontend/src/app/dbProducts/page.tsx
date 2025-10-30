"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  tags: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);


  const router = useRouter();

  // Fetch from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:4000/products/dbproduct");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const importProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/products/import");
      const data = await res.json();
      alert(`✅ Imported ${data.count} products!`);
      setProducts(data.products);
    } catch (err) {
      console.error(err);
      alert("❌ Import failed!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛍 Products</h1>
        {/* <button
          className="btn btn-primary"
          onClick={importProducts}
        >
          Import from FakeStore
        </button> */}
        <button
          className="btn btn-primary"
            onClick={() => router.push("/creatProduct")}        >
          Manage products
        </button>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p._id} className="card bg-base-200 shadow-xl p-4">
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <p className="text-gray-600">💰 ${p.price}</p>
              <p className="text-gray-500 text-sm">Stock: {p.stock}</p>
              <div className="mt-2">
                {p.tags.map((t, i) => (
                  <span
                    key={i}
                    className="badge badge-outline mr-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
