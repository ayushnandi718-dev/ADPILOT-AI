import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();
    
    // Mock AI response
    const responses: Record<string, string> = {
      "analyze": `# Campaign Analysis

Based on your current data, here's the performance overview:

## Key Metrics
- **Total Spend:** $32,450
- **Total Revenue:** $187,500
- **Blended ROAS:** 5.78x
- **Active Campaigns:** 6

## Top Performer
The **Summer Sale 2026** campaign leads with 5.78x ROAS.

## Recommendations
1. Increase budget for top performers
2. Review underperforming campaigns
3. Update ad creatives for better engagement`,
      "optimize": `# Budget Optimization Strategy

## Current Allocation
| Platform | Spend | ROAS |
|----------|-------|------|
| Google   | $24K  | 5.6x |
| Meta     | $18K  | 6.0x |
| TikTok   | $9K   | 5.1x |
| Taboola  | $15K  | 3.0x |

## Recommendations
1. **Increase Meta by 20%** - highest ROAS
2. **Reduce Taboola by 40%** - underperforming
3. **Shift savings to TikTok** - growing platform`,
    };

    const mockResponse = responses[message.toLowerCase().split(" ")[0]] || 
      `# AdPilot AI Response

I've analyzed your request about "${message}".

## Key Insights
- Your campaigns are performing well with a blended ROAS of 5.4x
- Total ad spend across all platforms: $89,450
- Total conversions: 3,245

## Recommendations
1. Consider A/B testing new ad creatives
2. Review audience targeting for underperforming segments
3. Optimize bidding strategies for high-converting placements

Would you like me to dive deeper into any specific area?`;

    return NextResponse.json({
      content: mockResponse,
      conversationId: conversationId || crypto.randomUUID(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
