import { NextResponse } from "next/server";
import { campaignService } from "@/services/campaign-service";
import { mockTimeSeriesData, mockTopCampaigns } from "@/mock";
import { mockNotifications } from "@/mock/notifications";

export async function GET() {
  try {
    const metrics = await campaignService.getDashboardMetrics();
    return NextResponse.json({
      metrics,
      timeSeries: mockTimeSeriesData.slice(-7),
      topCampaigns: mockTopCampaigns,
      alerts: mockNotifications.slice(0, 3),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
