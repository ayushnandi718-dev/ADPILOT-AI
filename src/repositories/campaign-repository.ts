import { prisma } from '@/lib/prisma';
import type { CampaignData } from '@/types';
import { mockCampaigns } from '@/mock';

export class CampaignRepository {
  async findAll(): Promise<CampaignData[]> {
    try {
      const campaigns = await prisma.campaign.findMany();
      return campaigns as unknown as CampaignData[];
    } catch {
      return mockCampaigns as CampaignData[];
    }
  }

  async findById(id: string): Promise<CampaignData | null> {
    try {
      const campaign = await prisma.campaign.findUnique({ where: { id } });
      return campaign as unknown as CampaignData;
    } catch {
      return (mockCampaigns.find(c => c.id === id) as CampaignData) || null;
    }
  }

  async findByWorkspace(workspaceId: string): Promise<CampaignData[]> {
    try {
      const campaigns = await prisma.campaign.findMany({ where: { workspaceId } });
      return campaigns as unknown as CampaignData[];
    } catch {
      return mockCampaigns as CampaignData[];
    }
  }
}

export const campaignRepository = new CampaignRepository();
