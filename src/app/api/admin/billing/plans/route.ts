import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const plans = await prisma.billingPlan.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json({ plans });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.price !== undefined) data.price = body.price;
  if (body.currency) data.currency = body.currency;
  if (body.billingCycle) data.billingCycle = body.billingCycle;
  if (body.maxCampaigns !== undefined) data.maxCampaigns = body.maxCampaigns;
  if (body.maxAiQueries !== undefined) data.maxAiQueries = body.maxAiQueries;
  if (body.maxCreatives !== undefined) data.maxCreatives = body.maxCreatives;
  if (body.apiLimit !== undefined) data.apiLimit = body.apiLimit;
  if (body.features) data.features = body.features;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const plan = await prisma.billingPlan.update({ where: { id: body.id }, data });
  return NextResponse.json({ plan });
}
