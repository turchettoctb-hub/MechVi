import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanPassword = String(password || "");

    if (!cleanEmail || cleanPassword.length < 6) {
      return NextResponse.json({ error: "Invalid email or password (min 6 chars)." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 400 });

    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name ? String(name) : null,
        passwordHash,
        tier: "FREE",
        reportCredits: 0,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Register failed" }, { status: 500 });
  }
}
