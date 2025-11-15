export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth0 } from "@/lib/auth0";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.sub;
  const { deviceId } = await req.json();

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  await prisma.deviceSession.updateMany({
    where: { userId, deviceId },
    data: { forcedLogout: true },
  });

  return NextResponse.json({ ok: true });
}
