import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ ok: false });

  const userId = session.user.sub;
  const deviceId = req.headers.get("x-device-id");

  if (!deviceId) {
    return NextResponse.json({
      ok: false,
      reason: "no-device-id"
    });
  }

  const device = await prisma.deviceSession.findFirst({
    where: { userId, deviceId }
  });

  if (!device) {
    return NextResponse.json({
      ok: false,
      reason: "not-registered"
    });
  }

  if (device.forcedLogout) {
    return NextResponse.json({
      ok: false,
      reason: "evicted"
    });
  }

  return NextResponse.json({ ok: true });
}
