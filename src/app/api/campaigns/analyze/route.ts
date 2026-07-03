import { NextResponse } from "next/server";
import { campaignService } from "@/services/campaign-service";

export async function POST(request: Request) {
  try {
    const { apiKey, model } = await request.json();
    const campaigns = await campaignService.getCampaigns();
    const activeCampaigns = campaigns.filter(c => c.status === "active");
    const totalSpend = activeCampaigns.reduce((s, c) => s + c.spent, 0);
    const totalRevenue = activeCampaigns.reduce((s, c) => s + c.revenue, 0);
    const totalConversions = activeCampaigns.reduce((s, c) => s + c.conversions, 0);
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0";
    const cpa = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0";

    const campaignSummary = activeCampaigns.map(c =>
      `- ${c.name} (${c.platform}): $${c.spent.toLocaleString()} spent, $${c.revenue.toLocaleString()} revenue, ${c.roas.toFixed(2)}x ROAS, ${c.ctr.toFixed(2)}% CTR, $${(c.spent / (c.conversions || 1)).toFixed(2)} CPA, ${c.conversions} conversions`
    ).join("\n");

    const analysisPrompt = `You are a senior marketing analyst. Analyze these ad campaigns and provide:

1. EXECUTIVE SUMMARY (2-3 sentences)
2. WASTED SPEND ANALYSIS - Which campaigns are underperforming and how much budget should be reallocated
3. TOP OPPORTUNITIES - Ranked by potential revenue impact (high/medium/low)
4. BUDGET REALLOCATION RECOMMENDATIONS - Specific dollar amounts to move between campaigns
5. CREATIVE RECOMMENDATIONS - What types of creatives to test for each platform
6. RISK FLAGS - Any campaigns approaching trouble

Campaign Data:
${campaignSummary}

Overall Metrics:
- Total Active Spend: $${totalSpend.toLocaleString()}
- Total Revenue: $${totalRevenue.toLocaleString()}
- Blended ROAS: ${roas}x
- Blended CPA: $${cpa}
- Active Campaigns: ${activeCampaigns.length}

Format your response in markdown with clear sections. Be specific with numbers.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey || process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://adpilot.ai",
        "X-Title": "AdPilot AI",
      },
      body: JSON.stringify({
        model: model || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a world-class marketing analyst. You provide specific, data-driven analysis. Always include numbers and percentages." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Analysis failed to generate.";

    return NextResponse.json({ analysis: content, model: data.model });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
