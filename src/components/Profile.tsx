"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import DeviceManager from "./DeviceManager";

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="text-xs text-slate-600 font-light">Loading user profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const phone = typeof window !== "undefined" ? localStorage.getItem("phone") : null;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center bg-white p-4 rounded-none border border-slate-200">
        {user.picture && <img src={user.picture || "/vercel.svg"} alt={user.name || "User"} className="w-12 h-12 rounded-none object-cover" />}
        <div className="flex-1">
          <h2 className="text-sm font-light text-slate-900">{user.name}</h2>
          <p className="text-xs font-light text-slate-600 mt-1">{user.email}</p>
          <p className="text-xs font-light text-slate-600 mt-1"><span className="font-medium">Phone:</span> {phone ?? "Not provided"}</p>
        </div>
      </div>

      <DeviceManager />
    </div>
  );
}
