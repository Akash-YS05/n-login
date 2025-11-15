"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@auth0/nextjs-auth0/client";

type DeviceInfo = {
  id: string;
  deviceId: string;
  userAgent?: string | null;
  createdAt?: string | Date;
  displayName?: string | null;
};

export default function DeviceManager() {
  const { user, isLoading } = useUser();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showChooser, setShowChooser] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  function setCookie(name: string, value: string, days = 365) {
    const exp = new Date();
    exp.setDate(exp.getDate() + days);
    document.cookie = `${name}=${value}; expires=${exp.toUTCString()}; path=/; samesite=lax`;
  }
  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    if (match) return match[2];
    return null;
  }

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    let id = getCookie("deviceId");
    if (!id) {
      id = uuidv4();
      setCookie("deviceId", id);
    }
    setDeviceId(id);

    const storedPhone = localStorage.getItem("phone");
    if (storedPhone) setPhone(storedPhone);

    registerDevice(id, displayName || user.name || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  async function registerDevice(id: string, display?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/device/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: id, displayName: display }),
      });
      const j = await res.json();
      if (!j.ok && j.reason === "MAX_DEVICES" && j.devices) {
        setDevices(j.devices);
        setShowChooser(true);
      } else {
        setShowChooser(false);
        setDevices([]);
      }
    } catch (err) {
      console.error("register device failed", err);
    } finally {
      setLoading(false);
    }
  }

  async function evictAndRegister(targetDeviceId: string) {
    setLoading(true);
    try {
      await fetch("/api/device/evict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: targetDeviceId }),
      });
      if (deviceId) await registerDevice(deviceId, displayName || undefined);
      setShowChooser(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function savePhone() {
    localStorage.setItem("phone", phone);
    alert("Phone saved locally — it will show on private page.");
  }

  if (!user) return null;
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex flex-col justify-between text-sm">
            <div>
              <div className="text-sm text-slate-700">Device ID: <span className="text-xs">{deviceId}</span></div>
            </div>
            <div className="">
              <div className="text-sm text-slate-700">Signed in as: <span className="text-xs">{user.name}</span></div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <label className="block text-xs font-medium text-slate-700 mb-2">Phone number</label>
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 border border-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="+91-9999999999"
              />
              <button onClick={savePhone} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Device label (optional)</label>
            <div className="flex gap-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 border border-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="My laptop / Phone"
              />
              <button
                onClick={() => {
                  if (deviceId) registerDevice(deviceId, displayName);
                }}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChooser && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Maximum devices reached</h3>
          <p className="text-sm text-slate-600 mb-4">
            You have reached the allowed device limit. Choose a device to sign out, or cancel to abort login.
          </p>

          <ul className="space-y-2 mb-4">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between border border-slate-200 p-3 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{d.displayName ?? d.userAgent ?? "Unknown device"}</div>
                  <div className="text-xs text-slate-500">Created: {new Date(d.createdAt || "").toLocaleString()}</div>
                  <div className="text-xs text-slate-400">deviceId: {d.deviceId}</div>
                </div>
                <button
                  onClick={() => evictAndRegister(d.deviceId)}
                  className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Sign out
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              setCookie("deviceId", "", -1);
              window.location.href = "/";
            }}
            className="w-full px-4 py-2 border border-slate-300 text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel login
          </button>
        </div>
      )}
    </div>
  );
}
