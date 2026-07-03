import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createToken, setAuthCookie } from "@/lib/auth/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check predefined admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword && email === adminEmail) {
      if (password !== adminPassword) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        const passwordHash = await hashPassword(password);
        user = await prisma.user.create({
          data: {
            email,
            name: "Admin",
            clerkId: `local_${crypto.randomUUID()}`,
            passwordHash,
            role: "admin",
            emailVerified: true,
            plan: "enterprise",
          },
        });
      } else {
        const passwordHash = await hashPassword(password);
        const needsUpdate = user.role !== "admin" || !user.passwordHash ||
          !(await verifyPassword(password, user.passwordHash));

        if (needsUpdate) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "admin", passwordHash },
          });
        }
      }

      const token = createToken({ userId: user.id, email: user.email });
      await setAuthCookie(token);

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: "admin",
          emailVerified: user.emailVerified,
          plan: user.plan,
        },
      });
    }

    // Normal login flow for regular users
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerified: user.emailVerified,
        plan: user.plan,
      },
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
