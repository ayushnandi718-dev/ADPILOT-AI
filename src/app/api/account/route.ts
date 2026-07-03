import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-auth";
import { verifyPassword } from "@/lib/auth/auth";
import { clearAuthCookie } from "@/lib/auth/auth";

export async function DELETE(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password is required to delete account" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Cannot delete account" }, { status: 400 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });
    }

    // Delete all user-related data
    const workspaceIds = (await prisma.workspace.findMany({ where: { userId }, select: { id: true } })).map(w => w.id);

    for (const wsId of workspaceIds) {
      await prisma.campaign.deleteMany({ where: { workspaceId: wsId } });
      await prisma.creative.deleteMany({ where: { workspaceId: wsId } });
      await prisma.insight.deleteMany({ where: { workspaceId: wsId } });
      await prisma.recommendation.deleteMany({ where: { workspaceId: wsId } });
      const convoIds = (await prisma.conversation.findMany({ where: { workspaceId: wsId }, select: { id: true } })).map(c => c.id);
      await prisma.message.deleteMany({ where: { conversationId: { in: convoIds } } });
      await prisma.conversation.deleteMany({ where: { workspaceId: wsId } });
      const autoIds = (await prisma.automation.findMany({ where: { workspaceId: wsId }, select: { id: true } })).map(a => a.id);
      await prisma.notification.deleteMany({ where: { automationId: { in: autoIds } } });
      await prisma.automation.deleteMany({ where: { workspaceId: wsId } });
      await prisma.report.deleteMany({ where: { workspaceId: wsId } });
      await prisma.integration.deleteMany({ where: { workspaceId: wsId } });
    }
    await prisma.workspace.deleteMany({ where: { userId } });
    await prisma.settings.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.auditLog.deleteMany({ where: { userId } });

    await prisma.user.delete({ where: { id: userId } });
    await clearAuthCookie();

    return NextResponse.json({ message: "Account deleted" });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
