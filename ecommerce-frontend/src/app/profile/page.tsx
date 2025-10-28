"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../config/api";

interface User {
  id: string;
  email: string;
  userName?: string;
  image?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
  type StoredUser = Partial<User> & { _id?: string };
  const parsed = JSON.parse(stored) as StoredUser;
  const effectiveId = parsed?.id || parsed?._id;
  return effectiveId ? ({ ...parsed, id: effectiveId } as User) : null;
    } catch (e) {
      console.error("Failed to load user from storage", e);
      return null;
    }
  });

  // Local editable fields
  const [displayName, setDisplayName] = useState<string>(user?.userName || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string>("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string>("");

  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMsg, setImageMsg] = useState<string>("");

  const avatarSrc = useMemo(() => (
    imagePreview || user?.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
  ), [imagePreview, user?.image]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    // Optionally clear cart as part of sign out
    // localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
    router.push("/login");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const res = await fetch(`${api.baseUrl}/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: displayName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update profile (${res.status})`);
      }
      const updated: User | undefined = data?.user;
      if (updated) {
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        setProfileMsg("Profile updated successfully");
        window.dispatchEvent(new Event("profileUpdated"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Profile update failed";
      setProfileMsg(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordMsg("");
    if (newPassword !== confirmPassword) {
      setPasswordMsg("New password and confirm password do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${api.baseUrl}/api/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update password (${res.status})`);
      }
      setPasswordMsg("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password update failed";
      setPasswordMsg(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSelectFile = (file: File | null) => {
    if (!file) return setImagePreview(undefined);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!imagePreview) {
      setImageMsg("Please select an image to upload");
      return;
    }
    setUploadingImage(true);
    setImageMsg("");
    try {
      const res = await fetch(`${api.baseUrl}/api/users/${user.id}/image`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update image (${res.status})`);
      }
      const updated: User | undefined = data?.user;
      if (updated) {
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        setImageMsg("Profile image updated");
        window.dispatchEvent(new Event("profileUpdated"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image update failed";
      setImageMsg(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="alert alert-info">
          <span>Please log in to view your profile.</span>
        </div>
        <div className="mt-4">
          <Link className="btn btn-primary" href="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-200 p-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary shadow">
              <Image
                src={avatarSrc}
                alt="User avatar"
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div>
              <div className="text-lg font-semibold">{user.userName || "Unnamed User"}</div>
              <div className="text-sm opacity-70">{user.email}</div>
              <div className="text-xs opacity-50 mt-1">User ID: <span className="font-mono break-all">{user.id}</span></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/orders" className="btn btn-ghost btn-sm">View Orders</Link>
            <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        <div className="card bg-base-200 p-6 md:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="mb-4 text-sm opacity-80">Update your display name and email.</p>
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text">Display Name</span></label>
                <input className="input input-bordered w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div>
                <label className="label"><span className="label-text">Email</span></label>
                <input type="email" className="input input-bordered w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className={`btn btn-primary ${savingProfile ? 'loading' : ''}`} disabled={savingProfile}>Save Profile</button>
                {profileMsg && <span className="self-center text-sm opacity-80">{profileMsg}</span>}
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Change Password</h2>
            <p className="mb-4 text-sm opacity-80">Enter your current password and a new one.</p>
            <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text">Current Password</span></label>
                <input type="password" className="input input-bordered w-full" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="label"><span className="label-text">New Password</span></label>
                <input type="password" className="input input-bordered w-full" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="label"><span className="label-text">Confirm New Password</span></label>
                <input type="password" className="input input-bordered w-full" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className={`btn btn-primary ${savingPassword ? 'loading' : ''}`} disabled={savingPassword}>Update Password</button>
                {passwordMsg && <span className="self-center text-sm opacity-80">{passwordMsg}</span>}
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Profile Image</h2>
            <p className="mb-4 text-sm opacity-80">Upload a small PNG or JPG. We store it inline (base64) for this demo.</p>
            <form onSubmit={handleUploadImage} className="space-y-3">
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={(e) => handleSelectFile(e.target.files?.[0] || null)}
              />
              <div className="flex gap-2">
                <button type="submit" className={`btn btn-primary ${uploadingImage ? 'loading' : ''}`} disabled={uploadingImage}>Upload Image</button>
                {imageMsg && <span className="self-center text-sm opacity-80">{imageMsg}</span>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
