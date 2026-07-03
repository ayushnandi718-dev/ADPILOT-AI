import { NextResponse } from "next/server";
import { mockNotifications } from "@/mock";

export async function GET() {
  return NextResponse.json(mockNotifications);
}

export async function PATCH(request: Request) {
  try {
    const { id, isRead } = await request.json();
    return NextResponse.json({ id, isRead, updated: true });
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
