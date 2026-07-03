import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const invoices = await prisma.invoice.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      userId: body.userId,
      subscriptionId: body.subscriptionId,
      transactionId: body.transactionId,
      type: body.type || "invoice",
      status: body.status || "paid",
      amount: body.amount,
      tax: body.tax || 0,
      total: body.amount + (body.tax || 0),
      currency: body.currency || "USD",
      billingAddress: body.billingAddress,
      taxId: body.taxId,
      notes: body.notes,
    },
  });

  return NextResponse.json({ invoice });
}
