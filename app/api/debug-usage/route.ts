import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function monthKeyUTC(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email || null;

  if (!userId) return NextResponse.json({ ok: false, error: "Not authenticated / missing user id" }, { status: 401 });

  const mk = monthKeyUTC();
  const usage = await prisma.usage.findUnique({ where: { userId_monthKey: { userId, monthKey: mk } } });

  return NextResponse.json({
    ok: true,
    email,
    userId,
    monthKey: mk,
    usageCount: usage?.count ?? 0,
    freeLimit: Number(process.env.MECHVI_FREE_MONTHLY_LIMIT || 3),
    subLimit: Number(process.env.MECHVI_SUBSCRIBER_MONTHLY_LIMIT || 300),
  });
}
