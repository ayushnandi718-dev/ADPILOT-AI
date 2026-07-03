"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Target,
  Activity,
  MousePointerClick,
  Users,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCampaignStore } from "@/store/campaign-store";
import { formatCurrency, formatPercentage, formatCompactNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const platformBadge = (platform: string) => {
  const colors: Record<string, string> = {
    Google: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Meta: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    TikTok: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Taboola: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return colors[platform] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
};

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
};

function MetricDetailCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: "up" | "down";
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[#9CA3AF]">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
          <Icon className="h-4 w-4 text-[#7C3AED]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <span
        className={`text-xs font-medium ${
          trend === "up" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {change}
      </span>
    </motion.div>
  );
}

const dailyPerformance = [
  { day: "Mon", spend: 1200, revenue: 3400, impressions: 45000, clicks: 1800 },
  { day: "Tue", spend: 1350, revenue: 3800, impressions: 52000, clicks: 2100 },
  { day: "Wed", spend: 1100, revenue: 4200, impressions: 48000, clicks: 1950 },
  { day: "Thu", spend: 1450, revenue: 4600, impressions: 56000, clicks: 2300 },
  { day: "Fri", spend: 1300, revenue: 4100, impressions: 51000, clicks: 2050 },
  { day: "Sat", spend: 980, revenue: 2900, impressions: 38000, clicks: 1500 },
  { day: "Sun", spend: 1050, revenue: 3200, impressions: 41000, clicks: 1650 },
];

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id));

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Target className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">
            Campaign not found
          </p>
          <Link
            href="/dashboard/campaigns"
            className="text-sm text-[#7C3AED] hover:text-[#A78BFA]"
          >
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const budgetPercent =
    campaign.budget > 0
      ? Math.min(Math.round((campaign.spent / campaign.budget) * 100), 100)
      : 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Back & Header */}
      <motion.div variants={fadeInUp}>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-0.5 rounded-full border",
                platformBadge(campaign.platform)
              )}
            >
              {campaign.platform}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize",
                statusBadge(campaign.status)
              )}
            >
              {campaign.status}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <MetricDetailCard
          title="Spend"
          value={formatCurrency(campaign.spent)}
          change="+8.3% vs target"
          trend="up"
          icon={DollarSign}
        />
        <MetricDetailCard
          title="Revenue"
          value={formatCurrency(campaign.revenue)}
          change="+22.1% vs target"
          trend="up"
          icon={TrendingUp}
        />
        <MetricDetailCard
          title="ROAS"
          value={`${campaign.roas.toFixed(2)}x`}
          change="+12.7% vs target"
          trend="up"
          icon={Target}
        />
        <MetricDetailCard
          title="CPA"
          value={formatCurrency(campaign.spent / (campaign.conversions || 1))}
          change="-5.2% vs target"
          trend="down"
          icon={Activity}
        />
        <MetricDetailCard
          title="CTR"
          value={formatPercentage(campaign.ctr)}
          change="+3.1% vs target"
          trend="up"
          icon={MousePointerClick}
        />
        <MetricDetailCard
          title="Conversions"
          value={formatCompactNumber(campaign.conversions)}
          change="+18.4% vs target"
          trend="up"
          icon={Users}
        />
      </motion.div>

      {/* Performance Chart */}
      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-white">
              Performance Timeline
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Daily spend and revenue
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />
              <span className="text-xs text-[#9CA3AF]">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-xs text-[#9CA3AF]">Spend</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyPerformance}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#6B7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#1F2937",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7C3AED"
                fill="url(#revGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#22C55E"
                fill="url(#spGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Budget Utilization */}
      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-1">
          Budget Utilization
        </h3>
        <p className="text-xs text-[#9CA3AF] mb-4">
          {formatCurrency(campaign.spent)} spent of{" "}
          {formatCurrency(campaign.budget)} total budget
        </p>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-700"
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#6B7280]">
          <span>{budgetPercent}% utilized</span>
          <span>{formatCurrency(campaign.budget - campaign.spent)} remaining</span>
        </div>
      </motion.div>

      {/* Audience & Creative / Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Section */}
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            Target Audience
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1.5">Age Range</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">25-44</span>
                <span className="text-[10px] text-[#6B7280]">(Primary)</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1.5">Gender</p>
              <span className="text-sm text-white font-medium">All</span>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1.5">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Digital Marketing",
                  "SaaS",
                  "Business",
                  "Technology",
                  "Startups",
                ].map((interest) => (
                  <span
                    key={interest}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-[#D1D5DB] border border-white/5"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1.5">Locations</p>
              <span className="text-sm text-white font-medium">
                United States, Canada, United Kingdom
              </span>
            </div>
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            Campaign Timeline
          </h3>
          <div className="space-y-4">
            {[
              {
                date: "Mar 1, 2026",
                event: "Campaign launched",
                type: "success",
              },
              {
                date: "Mar 5, 2026",
                event: "Budget increased by 20%",
                type: "info",
              },
              {
                date: "Mar 10, 2026",
                event: "New creative variant added",
                type: "info",
              },
              {
                date: "Mar 15, 2026",
                event: "CTR threshold warning",
                type: "warning",
              },
              {
                date: "Mar 18, 2026",
                event: "Optimized audience targeting",
                type: "info",
              },
              {
                date: "Mar 22, 2026",
                event: "ROAS target exceeded",
                type: "success",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5",
                    item.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : item.type === "warning"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-blue-500/10 text-blue-400"
                  )}
                >
                  <Zap className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm text-white">{item.event}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Creative Previews */}
      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-4">
          Creative Previews
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Headline A", text: "Supercharge Your Marketing with AI", variant: "A" },
            { label: "Headline B", text: "The #1 AI Tool for Marketers", variant: "B" },
            { label: "Description A", text: "Optimize campaigns, generate copy, and automate workflows with our intelligent platform.", variant: "A" },
            { label: "Description B", text: "Join 500+ agencies using AI to drive 3x better campaign results.", variant: "B" },
          ].map((creative, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#9CA3AF]">
                  {creative.label}
                </span>
                <span className="text-[10px] font-mono text-[#6B7280] border border-white/5 px-1.5 py-0.5 rounded">
                  {creative.variant}
                </span>
              </div>
              <p className="text-sm text-white leading-relaxed">
                {creative.text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
