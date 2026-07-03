import { NextResponse } from "next/server";

export async function GET() {
  try {
    const reports = [
      { id: "rpt-001", name: "Weekly Performance Report", type: "weekly", status: "completed", createdAt: "2026-07-01" },
      { id: "rpt-002", name: "Monthly Analytics Summary", type: "monthly", status: "completed", createdAt: "2026-07-01" },
      { id: "rpt-003", name: "Campaign Performance - Q2", type: "custom", status: "generating", createdAt: "2026-07-03" },
    ];
    return NextResponse.json(reports);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    return NextResponse.json({
      id: `rpt-${Date.now()}`,
      ...data,
      status: "generating",
      createdAt: new Date().toISOString().split("T")[0],
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
