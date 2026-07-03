import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { workspaces: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { userId, role, plan } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const update: Record<string, string> = {};
  if (role) update.role = role;
  if (plan) update.plan = plan;

  const user = await prisma.user.update({
    where: { id: userId },
    data: update,
    select: { id: true, email: true, name: true, role: true, plan: true, emailVerified: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.message.deleteMany({ where: { conversation: { workspace: { userId } } } });
    await tx.conversation.deleteMany({ where: { workspace: { userId } } });
    await tx.recommendation.deleteMany({ where: { workspace: { userId } } });
    await tx.insight.deleteMany({ where: { workspace: { userId } } });
    await tx.creative.deleteMany({ where: { workspace: { userId } } });
    await tx.notification.deleteMany({ where: { automation: { workspace: { userId } } } });
    await tx.automation.deleteMany({ where: { workspace: { userId } } });
    await tx.report.deleteMany({ where: { workspace: { userId } } });
    await tx.integration.deleteMany({ where: { workspace: { userId } } });
    await tx.campaign.deleteMany({ where: { workspace: { userId } } });
    await tx.auditLog.deleteMany({ where: { userId } });
    await tx.settings.deleteMany({ where: { userId } });
    await tx.workspace.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  return NextResponse.json({ success: true });
}
