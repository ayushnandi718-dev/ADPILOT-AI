import { NextResponse } from "next/server";
import { campaignService } from "@/services/campaign-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await campaignService.getCampaign(id);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}
