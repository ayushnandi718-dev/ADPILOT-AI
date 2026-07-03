import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const [totalUsers, totalWorkspaces, planDistribution, userGrowth] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.user.groupBy({ by: ["plan"], _count: true }),
    prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalWorkspaces,
    planDistribution,
    recentUsers: userGrowth.length,
  });
}
