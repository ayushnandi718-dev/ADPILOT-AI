import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  if (!body.code || !body.type || body.value === undefined) {
    return NextResponse.json({ error: "code, type, and value required" }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
  if (existing) {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,
      maxUses: body.maxUses ?? null,
      minAmount: body.minAmount ?? null,
      maxDiscount: body.maxDiscount ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
      description: body.description,
    },
  });

  return NextResponse.json({ coupon });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: any = {};
  if (body.code) data.code = body.code.toUpperCase();
  if (body.type) data.type = body.type;
  if (body.value !== undefined) data.value = body.value;
  if (body.maxUses !== undefined) data.maxUses = body.maxUses;
  if (body.minAmount !== undefined) data.minAmount = body.minAmount;
  if (body.maxDiscount !== undefined) data.maxDiscount = body.maxDiscount;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.description !== undefined) data.description = body.description;

  const coupon = await prisma.coupon.update({ where: { id: body.id }, data });
  return NextResponse.json({ coupon });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
