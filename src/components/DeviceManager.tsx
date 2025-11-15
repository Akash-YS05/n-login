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
    <div className="device-manager mt-4">
      <div className="device-info card p-4 rounded shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Device ID</div>
            <div className="font-mono text-xs">{deviceId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Signed in as</div>
            <div className="font-medium">{user.name}</div>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm">Phone number</label>
          <div className="flex gap-2 mt-1">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              placeholder="+91-9999999999"
            />
            <button onClick={savePhone} className="bg-blue-600 text-white px-3 py-2 rounded">
              Save
            </button>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm">Device label (optional)</label>
          <div className="flex gap-2 mt-1">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              placeholder="My laptop / Phone"
            />
            <button
              onClick={() => {
                if (deviceId) registerDevice(deviceId, displayName);
              }}
              className="bg-green-600 text-white px-3 py-2 rounded"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {showChooser && (
        <div className="evict-panel mt-4 card p-4 rounded shadow-sm bg-white">
          <h3 className="font-semibold mb-2">Maximum devices reached</h3>
          <p className="text-sm text-gray-600 mb-3">
            You have reached the allowed device limit. Choose a device to sign out, or cancel to abort login.
          </p>

          <ul className="space-y-2">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <div className="font-medium">{d.displayName ?? d.userAgent ?? "Unknown device"}</div>
                  <div className="text-xs text-gray-500">Created: {new Date(d.createdAt || "").toLocaleString()}</div>
                  <div className="text-xs text-gray-400">deviceId: {d.deviceId}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => evictAndRegister(d.deviceId)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Sign out this device
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <button
              onClick={() => {
                setCookie("deviceId", "", -1);
                window.location.href = "/";
              }}
              className="px-4 py-2 border rounded"
            >
              Cancel login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
