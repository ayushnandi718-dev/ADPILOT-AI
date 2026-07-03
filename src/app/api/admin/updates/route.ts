import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const updates = await prisma.updateLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ updates });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { version, title, body, published } = await req.json();
  if (!version || !title || !body) {
    return NextResponse.json({ error: "version, title, and body required" }, { status: 400 });
  }

  const update = await prisma.updateLog.create({
    data: { version, title, body, published: published ?? true },
  });

  return NextResponse.json({ update });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id, version, title, body, published } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const data: Record<string, any> = {};
  if (version !== undefined) data.version = version;
  if (title !== undefined) data.title = title;
  if (body !== undefined) data.body = body;
  if (published !== undefined) data.published = published;

  const update = await prisma.updateLog.update({
    where: { id },
    data,
  });

  return NextResponse.json({ update });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.updateLog.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
