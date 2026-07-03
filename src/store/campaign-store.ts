"use client";

import { create } from "zustand";
import type { CampaignData } from "@/types";

interface CampaignFormData {
  name: string;
  platform: string;
  type: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

function calculateMetrics(d: CampaignFormData) {
  const ctr = d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0;
  const cpa = d.conversions > 0 ? d.spent / d.conversions : 0;
  const roas = d.spent > 0 ? d.revenue / d.spent : 0;
  return { ctr, cpa, roas };
}

interface CampaignState {
  campaigns: CampaignData[];
  isLoading: boolean;
  loadCampaigns: () => Promise<void>;
  addCampaign: (data: CampaignFormData) => CampaignData;
  updateCampaign: (id: string, data: Partial<CampaignFormData>) => void;
  deleteCampaign: (id: string) => void;
}

function generateId() {
  return `camp_${crypto.randomUUID().slice(0, 8)}`;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  isLoading: true,

  loadCampaigns: async () => {
    try {
      const stored = localStorage.getItem("adpilot_campaigns");
      if (stored) {
        set({ campaigns: JSON.parse(stored), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addCampaign: (data: CampaignFormData) => {
    const metrics = calculateMetrics(data);
    const campaign: CampaignData = {
      id: generateId(),
      ...data,
      ...metrics,
      qualityScore: Math.floor(Math.random() * 30) + 60,
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
    };
    const campaigns = [...get().campaigns, campaign];
    set({ campaigns });
    localStorage.setItem("adpilot_campaigns", JSON.stringify(campaigns));
    return campaign;
  },

  updateCampaign: (id: string, data: Partial<CampaignFormData>) => {
    const campaigns = get().campaigns.map((c) => {
      if (c.id !== id) return c;
      const merged = { ...c, ...data };
      const metrics = calculateMetrics(merged);
      return { ...merged, ...metrics };
    });
    set({ campaigns });
    localStorage.setItem("adpilot_campaigns", JSON.stringify(campaigns));
  },

  deleteCampaign: (id: string) => {
    const campaigns = get().campaigns.filter((c) => c.id !== id);
    set({ campaigns });
    localStorage.setItem("adpilot_campaigns", JSON.stringify(campaigns));
  },
}));
