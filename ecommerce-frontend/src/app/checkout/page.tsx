"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get cart items and user from localStorage
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const calculateTotals = () => {
    const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const taxRate = 0.19; // 19% VAT
    const taxPrice = subtotal * taxRate;
    const shippingPrice = subtotal > 50 ? 0 : 10; // Free shipping over €50
    const totalPrice = subtotal + taxPrice + shippingPrice;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxPrice: Number(taxPrice.toFixed(2)),
      shippingPrice: Number(shippingPrice.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user.id) {
      setError('Please log in to complete your order');
      setLoading(false);
      return;
    }

    const { subtotal, taxPrice, shippingPrice, totalPrice } = calculateTotals();

    try {
      const orderData = {
        userId: user.id,
        orderItems: cart.map((item: any) => ({
          name: item.title,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item.id
        })),
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const res = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await res.json();

      // Clear cart
      localStorage.setItem('cart', '[]');
      
      // Redirect to order confirmation
      router.push(`/orders/${order._id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress(prev => ({
                  ...prev,
                  city: e.target.value
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress(prev => ({
                  ...prev,
                  postalCode: e.target.value
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress(prev => ({
                  ...prev,
                  country: e.target.value
                }))}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <select
                className="select select-bordered w-full"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="PayPal">PayPal</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            {error && (
              <div className="alert alert-error">
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Place Order
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="card bg-base-200 p-4">
            {cart.map((item: any) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>{item.title} × {item.quantity}</span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="divider"></div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€{totals.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (19%)</span>
                <span>€{totals.taxPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>€{totals.shippingPrice}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{totals.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}