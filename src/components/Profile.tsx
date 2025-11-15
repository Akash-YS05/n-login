"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import DeviceManager from "./DeviceManager";

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-text">Loading user profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const phone = typeof window !== "undefined" ? localStorage.getItem("phone") : null;

  return (
    <div className="profile-card action-card p-4">
      <div className="flex gap-4 items-center">
        {user.picture && <img src={user.picture} alt={user.name || "User"} className="w-16 h-16 rounded-full" />}
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm mt-1"><span className="font-medium">Phone:</span> {phone ?? "Not provided"}</p>
        </div>
      </div>

      <DeviceManager />
    </div>
  );
}
