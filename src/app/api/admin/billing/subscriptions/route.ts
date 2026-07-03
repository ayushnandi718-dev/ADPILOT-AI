import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, plan: true } },
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscriptions });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id, status, planId, planName, billingCycle, autoRenew, currentPeriodEnd } = await req.json();

  const data: any = {};
  if (status) data.status = status;
  if (planId) data.planId = planId;
  if (planName) data.planName = planName;
  if (billingCycle) data.billingCycle = billingCycle;
  if (autoRenew !== undefined) data.autoRenew = autoRenew;
  if (currentPeriodEnd) data.currentPeriodEnd = new Date(currentPeriodEnd);
  if (status === "cancelled") data.cancelledAt = new Date();

  const subscription = await prisma.subscription.update({
    where: { id },
    data,
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  // Sync user.plan with subscription planName
  await prisma.user.update({
    where: { id: subscription.userId },
    data: { plan: planName || subscription.planName },
  });

  return NextResponse.json({ subscription });
}
