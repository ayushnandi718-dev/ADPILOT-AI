import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const provider = searchParams.get("provider") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
      { id: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (provider) where.provider = provider;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } }, refunds: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total, page, limit });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  const transaction = await prisma.transaction.create({
    data: {
      userId: body.userId,
      subscriptionId: body.subscriptionId,
      provider: body.provider || "manual",
      paymentMethod: body.paymentMethod,
      planName: body.planName,
      amount: body.amount,
      currency: body.currency || "USD",
      tax: body.tax || 0,
      taxType: body.taxType,
      couponCode: body.couponCode,
      discountAmount: body.discountAmount || 0,
      status: body.status || "paid",
      description: body.description,
      billingAddress: body.billingAddress,
      taxId: body.taxId,
      paidAt: body.status === "paid" ? new Date() : null,
    },
  });

  return NextResponse.json({ transaction });
}
