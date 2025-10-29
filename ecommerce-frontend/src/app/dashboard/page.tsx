"use client";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, loading } = useAuth("/login");

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.userName}!</h1>
      <p>Your email: {user?.email}</p>
    </div>
  );
}
