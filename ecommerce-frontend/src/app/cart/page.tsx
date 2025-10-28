"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const cart = JSON.parse(storedCart);
          setCartItems(cart);
          // Calculate total
          const cartTotal = cart.reduce((sum: number, item: CartItem) => 
            sum + (item.price * item.quantity), 0);
          setTotal(cartTotal);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    };
    loadCart();
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ).filter(item => item.quantity > 0);

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Update total
    const newTotal = updatedCart.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  const removeItem = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Update total
    const newTotal = updatedCart.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div key={item.id} className="card card-side bg-base-100 shadow-xl">
            <figure className="w-48 h-48 relative">
              <Image
                src={item.image}
                alt={item.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{item.name}</h2>
              <p className="text-xl">${item.price.toFixed(2)}</p>
              <div className="flex items-center gap-4">
                <div className="join">
                  <button 
                    className="btn join-item"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <div className="join-item px-4 py-2 bg-base-200">
                    {item.quantity}
                  </div>
                  <button 
                    className="btn join-item"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="btn btn-error btn-sm"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="divider"></div>

      <div className="flex flex-col items-end gap-4">
        <div className="text-xl font-bold">
          Total: ${total.toFixed(2)}
        </div>
        <div className="flex gap-4">
          <Link href="/" className="btn btn-ghost">
            Continue Shopping
          </Link>
          <Link href="/checkout" className="btn btn-primary">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}