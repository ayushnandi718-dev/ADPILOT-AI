import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.settings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId },
    });
  }

  return NextResponse.json({
    theme: settings.theme,
    aiModel: settings.aiModel,
    aiApiKey: settings.aiApiKey || "",
    aiBaseUrl: settings.aiBaseUrl || "",
    notifications: settings.notifications,
    data: settings.data ? JSON.parse(settings.data) : {},
  });
}

export async function PUT(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (body.theme) update.theme = body.theme;
    if (body.aiModel) update.aiModel = body.aiModel;
    if (body.aiApiKey !== undefined) update.aiApiKey = body.aiApiKey;
    if (body.aiBaseUrl !== undefined) update.aiBaseUrl = body.aiBaseUrl;
    if (body.notifications !== undefined) update.notifications = body.notifications;
    if (body.data !== undefined) update.data = JSON.stringify(body.data);

    const settings = await prisma.settings.upsert({
      where: { userId },
      create: { userId, ...update },
      update,
    });

    return NextResponse.json({
      theme: settings.theme,
      aiModel: settings.aiModel,
      aiApiKey: settings.aiApiKey || "",
      aiBaseUrl: settings.aiBaseUrl || "",
      notifications: settings.notifications,
      data: settings.data ? JSON.parse(settings.data) : {},
    });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
