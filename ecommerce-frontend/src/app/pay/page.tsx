"use client";
import { useRouter } from "next/navigation"; // ✅ richtiger Import
import { useEffect, useState } from "react";

export default function OrderPage() {
  const router = useRouter(); // ✅ Router-Hook
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setCart(storedCart);
    setUserId(storedUser?._id || storedUser?.id || "");
  }, []);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id) {
        alert("Bitte zuerst einloggen!");
        return;
      }

      const orderData = {
        userId: user._id,
        orderItems: cart.map((item) => ({
          name: item.title,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id || item.productId || item.id,
        })),
        shippingAddress: {
          address: address.address,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod: "PayPal",
        taxPrice: 0,
        shippingPrice: 5,
        totalPrice: cart.reduce((sum, i) => sum + i.price * i.quantity, 0) + 5,
      };

      const res = await fetch("http://localhost:4000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Fehler beim Erstellen!");

      alert("✅ order is taken place!");
      localStorage.removeItem("cart");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Taking order place</h1>

      {/* Warenkorb */}
      <div className="space-y-3 mb-6">
        {cart.length === 0 ? (
          <p>Dein Warenkorb ist leer.</p>
        ) : (
          cart.map((item) => (
            <div key={item._id || item.id} className="flex justify-between border-b pb-2">
              <div>
                <p className="font-medium">{item.title}</p>
                <p>
                  ${item.price} × {item.quantity}
                </p>
              </div>
              <p>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>

      {/* Adresse */}
      <div className="space-y-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">Lieferadresse</h2>
        {["address", "city", "postalCode", "country"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field}
            className="input input-bordered w-full"
            value={address[field as keyof typeof address]}
            onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
          />
        ))}
      </div>

      <button
        onClick={handlePlaceOrder}
        className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
        disabled={loading}
      >
        {loading ? "Ordering..." : "Take Order"}
      </button>

      <button
        onClick={() => alert("✅ you will forward to payment page")} // ✅ funktioniert im Browser
        className={`btn btn-secondary w-full mt-2`}
      >
        Go to Payment
      </button>
    </div>
  );
}
