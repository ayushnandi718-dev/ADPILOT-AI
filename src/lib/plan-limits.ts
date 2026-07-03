export interface PlanLimits {
  maxCampaigns: number;
  maxAiQueries: number;
  maxCreativeGenerations: number;
}

export const planLimits: Record<string, PlanLimits> = {
  free: {
    maxCampaigns: 5,
    maxAiQueries: 50,
    maxCreativeGenerations: 10,
  },
  pro: {
    maxCampaigns: Infinity,
    maxAiQueries: Infinity,
    maxCreativeGenerations: Infinity,
  },
  enterprise: {
    maxCampaigns: Infinity,
    maxAiQueries: Infinity,
    maxCreativeGenerations: Infinity,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return planLimits[plan] || planLimits.free;
}

const USAGE_KEY = "adpilot_usage";

interface MonthlyUsage {
  month: string;
  aiQueries: number;
  creativeGenerations: number;
}

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getUsage(): MonthlyUsage {
  if (typeof window === "undefined") return { month: getCurrentMonth(), aiQueries: 0, creativeGenerations: 0 };
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MonthlyUsage;
      if (parsed.month === getCurrentMonth()) return parsed;
    }
  } catch { /* ignore */ }
  return { month: getCurrentMonth(), aiQueries: 0, creativeGenerations: 0 };
}

function saveUsage(usage: MonthlyUsage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export function getUsageCounts(): { aiQueries: number; creativeGenerations: number } {
  const usage = getUsage();
  return { aiQueries: usage.aiQueries, creativeGenerations: usage.creativeGenerations };
}

export function incrementAiQueries(): number {
  const usage = getUsage();
  usage.aiQueries++;
  saveUsage(usage);
  return usage.aiQueries;
}

export function incrementCreativeGenerations(): number {
  const usage = getUsage();
  usage.creativeGenerations++;
  saveUsage(usage);
  return usage.creativeGenerations;
}

export function checkCampaignLimit(plan: string, currentCount: number): { allowed: boolean; message?: string } {
  const limits = getPlanLimits(plan);
  if (currentCount >= limits.maxCampaigns) {
    return {
      allowed: false,
      message: `Free plan limited to ${limits.maxCampaigns} campaigns. Upgrade to Pro for unlimited campaigns.`,
    };
  }
  return { allowed: true };
}

export function checkAiQueryLimit(plan: string): { allowed: boolean; message?: string } {
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  if (usage.aiQueries >= limits.maxAiQueries) {
    return {
      allowed: false,
      message: `Free plan limited to ${limits.maxAiQueries} AI queries per month. Upgrade to Pro for unlimited queries.`,
    };
  }
  return { allowed: true };
}

export function checkCreativeLimit(plan: string): { allowed: boolean; message?: string } {
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  if (usage.creativeGenerations >= limits.maxCreativeGenerations) {
    return {
      allowed: false,
      message: `Free plan limited to ${limits.maxCreativeGenerations} creative generations per month. Upgrade to Pro for unlimited generations.`,
    };
  }
  return { allowed: true };
}
