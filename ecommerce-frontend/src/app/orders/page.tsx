"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id?: string;
  _id?: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  orderItems: Array<{
    name: string;
    qty: number;
  }>;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/api/orders/user/${user.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>ITEMS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderId = order.id || order._id || 'unknown';
                return (
                <tr key={orderId}>
                  <td>{orderId.substring(0, 8)}...</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>€{order.totalPrice.toFixed(2)}</td>
                  <td>
                    {order.isPaid ? (
                      <span className="badge badge-success">Yes</span>
                    ) : (
                      <span className="badge badge-warning">No</span>
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      <span className="badge badge-success">Yes</span>
                    ) : (
                      <span className="badge badge-warning">No</span>
                    )}
                  </td>
                  <td>
                    {order.orderItems.map(item => `${item.qty}x ${item.name}`).join(", ")}
                  </td>
                  <td>
                    <Link 
                      href={`/orders/${orderId}`}
                      className="btn btn-sm btn-primary"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}