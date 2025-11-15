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
    <button
      onClick={onLogout}
      className="inline-flex w-full items-center justify-center px-6 py-3 text-xs font-light text-slate-900 bg-slate-200 border border-slate-300 rounded-none hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-slate-900 tracking-wide"
    >
      LOG OUT
    </button>
  );
}
