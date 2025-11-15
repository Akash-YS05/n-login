"use client";

export default function LogoutButton() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onLogout(e: any) {
    e.preventDefault();
    const deviceId = document.cookie.match(/(^| )deviceId=([^;]+)/)?.[2];
    if (deviceId) {
      try {
        await fetch("/api/device/unregister", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
      } catch (err) {
        console.error("unregister failed", err);
      }
    }
    window.location.href = "/api/auth/logout";
  }

  return (
    <button onClick={onLogout} className="button logout bg-red-600 text-white px-4 py-2 rounded">
      Log Out
    </button>
  );
}
