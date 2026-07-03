import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Use /api/admin/stats, /api/admin/users, /api/admin/settings, /api/admin/updates" });
}
