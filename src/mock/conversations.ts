export const mockConversations = [
  {
    id: 'conv-001',
    title: 'Campaign Performance Analysis',
    model: 'openrouter',
    messages: [
      {
        id: 'msg-001',
        role: 'user',
        content: 'Analyze my campaign performance for this week',
        createdAt: '2026-07-03T10:00:00Z',
      },
      {
        id: 'msg-002',
        role: 'assistant',
        content: `# Weekly Performance Analysis

## Overview
Your campaigns performed **above average** this week with a blended ROAS of **5.4x**.

### Key Highlights
- **Total Spend:** $32,450
- **Total Revenue:** $187,500
- **Active Campaigns:** 6
- **Conversions:** 1,250

### Top Performer 🏆
**Summer Sale 2026** continues to lead with a 5.78x ROAS and 845K impressions.

### Action Items
1. Consider increasing budget for top performers
2. Review Taboola campaign performance
3. Update TikTok creatives for better CTR

Would you like a detailed breakdown by platform?`,
        createdAt: '2026-07-03T10:00:05Z',
      },
    ],
    createdAt: '2026-07-03T10:00:00Z',
  },
  {
    id: 'conv-002',
    title: 'Budget Optimization Strategy',
    model: 'openrouter',
    messages: [
      {
        id: 'msg-003',
        role: 'user',
        content: 'How should I optimize my budget across platforms?',
        createdAt: '2026-07-02T14:00:00Z',
      },
      {
        id: 'msg-004',
        role: 'assistant',
        content: `# Budget Optimization Strategy

Based on your current performance data, here's my recommendation:

## Current Allocation
| Platform | Budget | ROAS |
|----------|--------|------|
| Google   | $45K   | 5.6x |
| Meta     | $35K   | 6.0x |
| TikTok   | $25K   | 5.1x |
| Taboola  | $20K   | 3.0x |

## Recommended Changes
1. **Increase Meta budget** by 20% ($7K) - highest ROAS
2. **Maintain Google** spend - stable performance
3. **Reduce Taboola** by 50% ($10K) - underperforming
4. **Shift savings to TikTok** - growing platform

## Expected Outcome
- Blended ROAS improvement: +0.8x
- Additional revenue: ~$45K/month`,
        createdAt: '2026-07-02T14:00:08Z',
      },
    ],
    createdAt: '2026-07-02T14:00:00Z',
  },
];
