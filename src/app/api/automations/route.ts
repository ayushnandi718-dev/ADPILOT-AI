import { NextResponse } from "next/server";
import { mockAutomations } from "@/mock";

export async function GET() {
  try {
    return NextResponse.json(mockAutomations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newAutomation = {
      id: `auto-${Date.now()}`,
      ...data,
      isActive: true,
      lastRun: null,
    };
    return NextResponse.json(newAutomation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isActive } = await request.json();
    return NextResponse.json({ id, isActive, updated: true });
  } catch {
    return NextResponse.json({ error: "Failed to update automation" }, { status: 500 });
  }
}
