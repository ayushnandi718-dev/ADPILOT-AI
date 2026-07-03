import { NextResponse } from "next/server";
import { campaignService } from "@/services/campaign-service";
import { mockTimeSeriesData, mockPlatformBreakdown, mockChannelPerformance } from "@/mock";

export async function GET() {
  try {
    const metrics = await campaignService.getDashboardMetrics();
    return NextResponse.json({
      metrics,
      timeSeries: mockTimeSeriesData,
      platformBreakdown: mockPlatformBreakdown,
      channelPerformance: mockChannelPerformance,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
