import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = session.user.sub;
  const body = await req.json().catch(() => ({}));
  const deviceId = body.deviceId;
  if (!deviceId) return NextResponse.json({ error: "deviceId required" }, { status: 400 });

  await prisma.deviceSession.deleteMany({ where: { userId, deviceId } });
  return NextResponse.json({ ok: true });
}
