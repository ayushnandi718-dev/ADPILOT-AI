import { mockCampaigns } from '@/mock';
import type { CampaignData, DashboardMetrics, TimeSeriesData } from '@/types';
import { mockTimeSeriesData } from '@/mock';

class CampaignService {
  async getCampaigns(): Promise<CampaignData[]> {
    return mockCampaigns;
  }

  async getCampaign(id: string): Promise<CampaignData | undefined> {
    return mockCampaigns.find(c => c.id === id);
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const campaigns = mockCampaigns.filter(c => c.status === 'active');
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

    return {
      totalSpend,
      totalRevenue,
      totalConversions,
      totalImpressions,
      totalClicks,
      averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      averageCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
      averageRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      campaignHealthScore: 78,
      activeCampaigns: campaigns.length,
      budgetUtilization: totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0,
    };
  }

  async getTimeSeriesData(): Promise<TimeSeriesData[]> {
    return mockTimeSeriesData;
  }
}

export const campaignService = new CampaignService();
