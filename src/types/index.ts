export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
}

export interface CampaignData {
  id: string;
  name: string;
  platform: string;
  status: string;
  type: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
  qualityScore: number;
  startDate: string;
  endDate: string | null;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  date: string;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
}

export interface DashboardMetrics {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  averageCpa: number;
  averageRoas: number;
  campaignHealthScore: number;
  activeCampaigns: number;
  budgetUtilization: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  expectedImpact: 'high' | 'medium' | 'low';
  confidence: number;
  businessExplanation: string;
  suggestedAction: string;
  metric: string;
  currentValue: number;
  projectedValue: number;
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: string;
}

export interface AIProviderConfig {
  provider: 'openrouter' | 'ollama' | 'lmstudio' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: Record<string, unknown>;
  action: string;
  config: Record<string, unknown>;
  isActive: boolean;
  lastRun: string | null;
}

export interface ReportData {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  provider: string;
  status: string;
  lastSync: string | null;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'recommendation';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
