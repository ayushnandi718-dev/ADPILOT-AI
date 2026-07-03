export const mockTimeSeriesData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 5, 1);
  date.setDate(date.getDate() + i);
  const baseSpend = 5000 + Math.random() * 3000;
  const baseRevenue = baseSpend * (3 + Math.random() * 4);
  return {
    date: date.toISOString().split('T')[0],
    spend: Math.round(baseSpend * 100) / 100,
    revenue: Math.round(baseRevenue * 100) / 100,
    impressions: Math.round(100000 + Math.random() * 200000),
    clicks: Math.round(2000 + Math.random() * 5000),
    conversions: Math.round(50 + Math.random() * 200),
    ctr: Math.round((2 + Math.random() * 3) * 100) / 100,
    cpa: Math.round((15 + Math.random() * 30) * 100) / 100,
    roas: Math.round((2 + Math.random() * 5) * 100) / 100,
  };
});

export const mockPlatformBreakdown = [
  { name: 'Google Ads', value: 45, color: '#4285F4' },
  { name: 'Meta Ads', value: 30, color: '#1877F2' },
  { name: 'TikTok Ads', value: 15, color: '#000000' },
  { name: 'Taboola', value: 10, color: '#E71D36' },
];

export const mockChannelPerformance = [
  { channel: 'Search', spend: 45000, revenue: 270000, roas: 6.0, conversions: 1700 },
  { channel: 'Social', spend: 35000, revenue: 210000, roas: 6.0, conversions: 1400 },
  { channel: 'Display', spend: 25000, revenue: 112500, roas: 4.5, conversions: 800 },
  { channel: 'Video', spend: 20000, revenue: 100000, roas: 5.0, conversions: 600 },
  { channel: 'Native', spend: 15000, revenue: 52500, roas: 3.5, conversions: 350 },
];

export const mockTopCampaigns = [
  { name: 'Summer Sale 2026', spend: 32450, revenue: 187500, roas: 5.78, conversions: 1250 },
  { name: 'Brand Awareness', spend: 18200, revenue: 124600, roas: 6.85, conversions: 890 },
  { name: 'Product Launch', spend: 22100, revenue: 115680, roas: 5.23, conversions: 723 },
  { name: 'YouTube Pre-Roll', spend: 15600, revenue: 82080, roas: 5.26, conversions: 456 },
  { name: 'Retargeting Display', spend: 11200, revenue: 66750, roas: 5.96, conversions: 445 },
];
