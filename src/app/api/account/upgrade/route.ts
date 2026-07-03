import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-auth";

const validPlans = ["free", "pro", "enterprise"];

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = await req.json();

    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, emailVerified: true, plan: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }
}
