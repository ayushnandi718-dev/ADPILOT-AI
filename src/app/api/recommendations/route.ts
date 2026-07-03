import { NextResponse } from "next/server";
import { mockRecommendations } from "@/mock";

export async function GET() {
  try {
    return NextResponse.json(mockRecommendations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    return NextResponse.json({ id, status, updated: true });
  } catch {
    return NextResponse.json({ error: "Failed to update recommendation" }, { status: 500 });
  }
}
