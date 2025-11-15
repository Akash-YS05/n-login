"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ForcedLogoutPage() {
  const params = useSearchParams();
  const reason = params?.get("reason") ?? "evicted";

  async function doLogout() {
    await fetch("/api/auth/logout", { method: "GET" });
    document.cookie = "deviceId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = "/";
  }

  const friendly =
    reason === "evicted"
      ? "You were signed out because another device used your account."
      : reason === "not_registered"
      ? "Your session was invalidated — please sign in again."
      : "You were signed out.";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white shadow rounded p-6 text-center">
        <h1 className="text-2xl font-bold mb-3">Signed out</h1>
        <p className="text-gray-700 mb-4">{friendly}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={doLogout} className="px-4 py-2 bg-blue-600 text-white rounded">
            Sign in again
          </button>
          <Link href="/" className="px-4 py-2 border rounded">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
