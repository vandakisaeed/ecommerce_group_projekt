"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface OrderItem {
  _id: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
}

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const isHex24 = (val: unknown): val is string => typeof val === 'string' && /^[a-fA-F0-9]{24}$/.test(val);
        if (!isHex24(id)) {
          console.error('Invalid order id in URL param:', id);
          setError('Invalid order id');
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:4000/api/orders/${id}`);
        if (!res.ok) {
          // Try to parse JSON error, otherwise read text for debugging
          let details = '';
          try {
            const errJson = await res.json();
            details = errJson.message || JSON.stringify(errJson);
          } catch {
            try {
              const text = await res.text();
              details = text.slice(0, 1000);
            } catch (tErr) {
              details = String(tErr);
            }
          }
          console.error('Order fetch failed', res.status, details);
          setError(`Failed to fetch order: ${res.status} ${details}`);
          return;
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Order {order._id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Shipping</h2>
            <p><strong>Name:</strong> {order.user.userName}</p>
            <p><strong>Email:</strong> {order.user.email}</p>
            <p><strong>Address:</strong> {order.shippingAddress.address},</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
            {order.isDelivered ? (
              <div className="alert alert-success">Delivered on {new Date(order.deliveredAt!).toLocaleDateString()}</div>
            ) : (
              <div className="alert alert-info">Not Delivered</div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Payment</h2>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            {order.isPaid ? (
              <div className="alert alert-success">Paid on {new Date(order.paidAt!).toLocaleDateString()}</div>
            ) : (
              <div className="alert alert-warning">Not Paid</div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p>{item.qty} × €{item.price} = €{(item.qty * item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card bg-base-200 p-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items</span>
                <span>€{order.orderItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>€{order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>€{order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {!order.isPaid && (
              <div className="mt-4">
                <button className="btn btn-primary w-full">Pay Now</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}