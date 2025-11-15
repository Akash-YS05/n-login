import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
// import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = session.user.sub;
  const body = await req.json().catch(() => ({}));
  const deviceId = body.deviceId;
  const displayName = body.displayName || null;
  const maxDevices = Number(process.env.MAX_DEVICES || 3);

  if (!deviceId) return NextResponse.json({ error: "deviceId required" }, { status: 400 });

  const active = await prisma.deviceSession.findMany({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });

  const existing = await prisma.deviceSession.findFirst({
    where: { userId, deviceId },
  });

  if (existing) {
    await prisma.deviceSession.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date(), userAgent: req.headers.get("user-agent") ?? undefined },
    });
    return NextResponse.json({ ok: true, activeCount: active.length });
  }

  //if adding will exceed limit, return devices list to allow user to choose one to evict
  if (active.length >= maxDevices) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = active.map((d) => ({
      id: d.id,
      deviceId: d.deviceId,
      userAgent: d.userAgent,
      createdAt: d.createdAt,
      forcedLogout: d.forcedLogout,
      displayName: d.displayName,
    }));
    return NextResponse.json({ ok: false, reason: "MAX_DEVICES", devices: list }, { status: 200 });
  }

  await prisma.deviceSession.create({
    data: {
      userId,
      deviceId,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      displayName,
    },
  });

  return NextResponse.json({ ok: true, activeCount: active.length + 1 });
}
