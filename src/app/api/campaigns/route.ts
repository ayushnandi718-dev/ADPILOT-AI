import { NextResponse } from "next/server";
import { campaignService } from "@/services/campaign-service";

export async function GET() {
  try {
    const campaigns = await campaignService.getCampaigns();
    return NextResponse.json(campaigns);
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
