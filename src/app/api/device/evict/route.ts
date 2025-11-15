import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = session.user.sub;
  const body = await req.json().catch(() => ({}));
  const targetDeviceId = body.deviceId;

  if (!targetDeviceId) return NextResponse.json({ error: "deviceId required" }, { status: 400 });

  const target = await prisma.deviceSession.findFirst({ where: { userId, deviceId: targetDeviceId } });
  if (!target) return NextResponse.json({ error: "Device not found" }, { status: 404 });

  await prisma.deviceSession.update({
    where: { id: target.id },
    data: { forcedLogout: true },
  });

  return NextResponse.json({ ok: true });
}
