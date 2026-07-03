import { NextResponse } from "next/server";

interface ParsedCampaign {
  name: string;
  platform: string;
  status: string;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  budget: number;
}

function parseCSV(text: string): ParsedCampaign[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const campaigns: ParsedCampaign[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    if (values.length !== headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });
    campaigns.push({
      name: row["name"] || row["campaign"] || `Campaign ${i}`,
      platform: (row["platform"] || "unknown").toLowerCase(),
      status: (row["status"] || "active").toLowerCase(),
      spend: parseFloat(row["spend"] || row["spent"] || row["cost"] || "0"),
      revenue: parseFloat(row["revenue"] || row["sales"] || "0"),
      impressions: parseInt(row["impressions"] || row["impr"] || "0"),
      clicks: parseInt(row["clicks"] || "0"),
      conversions: parseInt(row["conversions"] || row["conv"] || row["purchases"] || "0"),
      budget: parseFloat(row["budget"] || "0"),
    });
  }
  return campaigns;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const apiKey = formData.get("apiKey") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
    }

    const text = await file.text();
    const campaigns = parseCSV(text);

    if (campaigns.length === 0) {
      return NextResponse.json({ error: "No valid campaign data found in CSV" }, { status: 400 });
    }

    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0";
    const cpa = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0";

    const campaignSummary = campaigns.map(c =>
      `- ${c.name} (${c.platform}): $${c.spend.toLocaleString()} spent, $${c.revenue.toLocaleString()} revenue, ${c.clicks} clicks, ${c.conversions} conversions, ROAS: ${c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : "N/A"}x`
    ).join("\n");

    const analysisPrompt = `You are a senior marketing analyst. Analyze these imported ad campaigns and provide:

1. EXECUTIVE SUMMARY (2-3 sentences on overall health)
2. WASTED SPEND - Identify which campaigns have ROAS below 2.0x and calculate exact wasted amount
3. TOP 3 CAMPAIGNS - Ranked by ROAS with explanation
4. BOTTOM 3 CAMPAIGNS - Ranked by ROAS with specific issues
5. BUDGET REALLOCATION PLAN - Specific dollar amounts to move between campaigns
6. QUICK WINS - 3 things they can do today to improve performance

Imported Campaign Data:
${campaignSummary}

Overall Metrics:
- Total Spend: $${totalSpend.toLocaleString()}
- Total Revenue: $${totalRevenue.toLocaleString()}
- Blended ROAS: ${roas}x
- Blended CPA: $${cpa}
- Total Campaigns: ${campaigns.length}

Format in markdown with clear sections. Be specific with numbers. If the data looks incomplete or has errors, note that.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey || process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://adpilot.ai",
        "X-Title": "AdPilot AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a world-class marketing analyst. Provide specific, data-driven analysis with exact numbers." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Analysis failed to generate.";

    return NextResponse.json({
      success: true,
      campaignsImported: campaigns.length,
      analysis,
      summary: { totalSpend, totalRevenue, roas: parseFloat(roas), cpa: parseFloat(cpa), campaignCount: campaigns.length },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
