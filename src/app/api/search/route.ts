import { NextResponse } from "next/server";
import { campaignService } from "@/services/campaign-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    
    const campaigns = await campaignService.getCampaigns();
    const filtered = campaigns.filter(c => c.name.toLowerCase().includes(query));
    
    return NextResponse.json({
      campaigns: filtered.slice(0, 5),
      total: filtered.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
