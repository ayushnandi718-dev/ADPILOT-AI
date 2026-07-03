import { NextResponse } from "next/server";

const mockIntegrations = [
  { id: "int-001", name: "Google Ads", provider: "google_ads", status: "connected", lastSync: "2026-07-03T08:00:00Z" },
  { id: "int-002", name: "Meta Ads", provider: "meta", status: "connected", lastSync: "2026-07-03T08:00:00Z" },
  { id: "int-003", name: "TikTok Ads", provider: "tiktok", status: "disconnected", lastSync: null },
  { id: "int-004", name: "Taboola", provider: "taboola", status: "error", lastSync: "2026-07-02T14:00:00Z" },
];

export async function GET() {
  return NextResponse.json(mockIntegrations);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    return NextResponse.json({
      id: `int-${Date.now()}`,
      ...data,
      status: "connected",
      lastSync: new Date().toISOString(),
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create integration" }, { status: 500 });
  }
}
