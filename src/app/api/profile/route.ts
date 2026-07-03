import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth/auth";

export async function PUT(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, avatarUrl, email, currentPassword, newPassword } = await req.json();
    const data: Record<string, string> = {};

    if (name !== undefined) data.name = name;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    if (email !== undefined) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change email" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: "Cannot change email" }, { status: 400 });
      }
      const { verifyPassword } = await import("@/lib/auth/auth");
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      data.email = email;
    }

    if (newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: "Cannot change password" }, { status: 400 });
      }

      const { verifyPassword } = await import("@/lib/auth/auth");
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      data.passwordHash = await hashPassword(newPassword);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, emailVerified: true, plan: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
