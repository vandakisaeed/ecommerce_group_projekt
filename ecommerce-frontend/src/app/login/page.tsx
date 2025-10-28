"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmail(user.email);
      setIsLoggedIn(true);
    }
  }, [router]);



  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth_server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Login failed with ${res.status}`);
      }

      const data = await res.json();
      if (data.user) {
        // Server sets httpOnly cookies for tokens; don't store token client-side
        console.log("✅ Login successful", data);
        localStorage.setItem("user", JSON.stringify(data.user));

        setIsLoggedIn(true);
        setEmail(data.user.email || email);
        //router.push("/");
      } else {
        setError((data.message || "Invalid email or password") + (data.debug ? `\nDebug: ${data.debug}` : ""));
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdate = async () => {
    try {
      // Use cookie-based auth; server verifies accessToken cookie
      const res = await fetch("/api/auth_server", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: newEmail || email,
          password: newPassword || password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Update failed with ${res.status}`);
      }

      const data = await res.json();
      if (data.user) {
        alert("✅ Account updated successfully!");
        localStorage.setItem("user", JSON.stringify(data.user));

        setEmail(data.user.email || newEmail || email);
        setPassword("");
        setNewEmail("");
        setNewPassword("");
      } else {
        throw new Error(data.message || "Failed to update account");
      }
    } catch (err: any) {
      alert(err.message || "Error updating account");
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    try {
      // Logout (server deletes refresh token). Account deletion endpoint is not implemented.
      const res = await fetch("/api/auth_server", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Logout failed with ${res.status}`);
      }

      // Server returns message on success
      const storedUser = localStorage.removeItem("user");
      setIsLoggedIn(false);
      router.push("/signup");
    } catch (err: any) {
      alert(err.message || "Error deleting account");
    }
  };
  
  // ✅ Sign out (only logs out, does NOT delete user)
  const handleSignOut = async () => {
    try {
      // Call backend to clear cookies or refresh tokens
      await fetch("/api/auth_server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "logout" }), // 👈 send logout action
      });
    } catch (err) {
      console.warn("Logout request failed, continuing logout...");
    }

    // Clear client-side session
    localStorage.removeItem("user");
    setIsLoggedIn(false);

    // Redirect to login page
    router.push("/login");
  };


  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          {!isLoggedIn ? (
            <>
              <h2 className="text-3xl font-bold text-center mb-4">Login</h2>

              <form onSubmit={handleLogin}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-error text-center mb-4">{error}</p>
                )}

                <button
                  className={`btn btn-primary w-full ${
                    loading ? "loading" : ""
                  }`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="text-center mt-4">
                Don’t have an account?{" "}
                <Link href="/signup" className="link link-primary">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">
                Welcome, {email}
              </h2>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">New Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  placeholder="new@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-success w-full mb-3" onClick={handleUpdate}>
                Update Account
              </button>

              <button className="btn btn-error w-full" onClick={handleDelete}>
                Delete Account
              </button>
                            {/* ✅ Sign Out Button */}
              <button className="btn btn-secondary w-full" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
