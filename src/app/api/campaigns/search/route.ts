import { NextResponse } from "next/server";
import { campaignService } from "@/services/campaign-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");
    
    let campaigns = await campaignService.getCampaigns();
    
    if (query) {
      campaigns = campaigns.filter(c => c.name.toLowerCase().includes(query));
    }
    if (platform) {
      campaigns = campaigns.filter(c => c.platform === platform);
    }
    if (status) {
      campaigns = campaigns.filter(c => c.status === status);
    }
    
    return NextResponse.json(campaigns);
  } catch {
    return NextResponse.json({ error: "Failed to search campaigns" }, { status: 500 });
  }
}
