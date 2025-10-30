"use client";

import { useState, useEffect } from "react";

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<any[]>([]); // store fetched products

  // ✅ Fetch all products from backend on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/products/dbproduct");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();

      // handle response shape (could be array or object)
      if (Array.isArray(data)) setProducts(data);
      else if (Array.isArray(data.products)) setProducts(data.products);
      else setProducts([]);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  // ✅ Add a new product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          tags: tags
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setMessage("✅ Product added successfully!");
      setName("");
      setPrice("");
      setStock("");
      setTags("");
      await fetchProducts(); // refresh product list
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Failed to add product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete a product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:4000/products/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setMessage("🗑️ Product deleted successfully!");
      await fetchProducts(); // refresh list
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Failed to delete product: " + err.message);
    }
  };

  // ✅ UI
  return (
    <div className="flex flex-col items-center min-h-screen bg-base-200 p-6 space-y-10">
      {/* Add Product Form */}
      <div className="card w-full max-w-lg bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create New Product 🛍️
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Stock quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />

          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Product"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm font-medium">{message}</p>
        )}
      </div>

      {/* Products List */}
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Existing Products 📦
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>${p.price}</td>
                    <td>{p.stock}</td>
                    <td>{Array.isArray(p.tags) ? p.tags.join(", ") : ""}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="btn btn-error btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
