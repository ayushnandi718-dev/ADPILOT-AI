import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const refunds = await prisma.refund.findMany({
    include: { transaction: { include: { user: { select: { id: true, name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ refunds });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  if (!body.transactionId || !body.amount) {
    return NextResponse.json({ error: "transactionId and amount required" }, { status: 400 });
  }

  const refund = await prisma.refund.create({
    data: {
      transactionId: body.transactionId,
      amount: body.amount,
      reason: body.reason,
      notes: body.notes,
      status: "pending",
    },
  });

  return NextResponse.json({ refund });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const refund = await prisma.refund.update({
    where: { id: body.id },
    data: {
      status: body.status,
      approvedBy: guard.userId,
      approvedAt: body.status === "approved" ? new Date() : null,
      notes: body.notes,
    },
  });

  if (body.status === "approved") {
    // Update the transaction status to refunded
    await prisma.transaction.update({
      where: { id: refund.transactionId },
      data: { status: "refunded", refundedAt: new Date() },
    });
  }

  return NextResponse.json({ refund });
}
