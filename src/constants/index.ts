export const THEME = {
  background: '#09090B',
  card: '#111827',
  accent: '#7C3AED',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

export const PLATFORMS = [
  { id: 'google', name: 'Google Ads', color: '#4285F4', icon: 'Google' },
  { id: 'meta', name: 'Meta Ads', color: '#1877F2', icon: 'Facebook' },
  { id: 'tiktok', name: 'TikTok Ads', color: '#000000', icon: 'Music2' },
  { id: 'taboola', name: 'Taboola', color: '#E71D36', icon: 'Newspaper' },
] as const;

export const AI_PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', description: 'Access multiple models through OpenRouter' },
  { id: 'ollama', name: 'Ollama', description: 'Local models via Ollama' },
  { id: 'lmstudio', name: 'LM Studio', description: 'Local models via LM Studio' },
  { id: 'custom', name: 'Custom', description: 'Custom OpenAI-compatible endpoint' },
] as const;

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Campaigns', href: '/campaigns', icon: 'Megaphone' },
  { label: 'Creative Studio', href: '/creative', icon: 'PenTool' },
  { label: 'AI Copilot', href: '/copilot', icon: 'Bot' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Automation', href: '/automation', icon: 'Workflow' },
  { label: 'Reports', href: '/reports', icon: 'FileText' },
  { label: 'Integrations', href: '/integrations', icon: 'Link2' },
] as const;

export const METRIC_COLORS = {
  spend: '#7C3AED',
  revenue: '#22C55E',
  ctr: '#3B82F6',
  conversions: '#F59E0B',
  cpa: '#EF4444',
  roas: '#22C55E',
} as const;
