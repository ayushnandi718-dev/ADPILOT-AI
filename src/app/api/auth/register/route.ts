import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth/auth";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        clerkId: `local_${crypto.randomUUID()}`,
        passwordHash,
        verificationToken,
        role: "user",
      },
    });

    await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug: `ws_${crypto.randomUUID().slice(0, 8)}`,
        userId: user.id,
      },
    });

    const token = createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerified: false,
        plan: "free",
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
