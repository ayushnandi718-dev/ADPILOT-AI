"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  MousePointerClick,
  Users,
  Sparkles,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useCampaignStore } from "@/store/campaign-store";
import { formatCurrency, formatPercentage, formatCompactNumber } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function MetricCard({
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
    <motion.div variants={fadeInUp} className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[#9CA3AF]">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
          <Icon className="h-4 w-4 text-[#7C3AED]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center gap-1.5">
        {trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
        <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>{change}</span>
      </div>
    </motion.div>
  );
}

function CircularProgress({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#healthGradient)" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold text-white">{value}%</span>
        <span className="text-[10px] text-[#9CA3AF]">Health</span>
      </div>
    </div>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const { campaigns } = useCampaignStore();

  const metrics = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "active");
    const totalSpend = active.reduce((s, c) => s + c.spent, 0);
    const totalRevenue = active.reduce((s, c) => s + c.revenue, 0);
    const totalConversions = active.reduce((s, c) => s + c.conversions, 0);
    const totalImpressions = active.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = active.reduce((s, c) => s + c.clicks, 0);
    const totalBudget = active.reduce((s, c) => s + c.budget, 0);
    return {
      totalSpend,
      totalRevenue,
      totalConversions,
      totalImpressions,
      totalClicks,
      averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      averageCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
      averageRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      campaignHealthScore: campaigns.length > 0 ? Math.min(Math.round(campaigns.filter(c => c.roas >= 1.5).length / campaigns.length * 100), 100) : 0,
      activeCampaigns: active.length,
      budgetUtilization: totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0,
    };
  }, [campaigns]);

  const topCampaigns = useMemo(() => [...campaigns].sort((a, b) => b.revenue - a.revenue).slice(0, 5), [campaigns]);

  const weeklyData = useMemo(() => {
    const total = { spend: 0, revenue: 0, clicks: 0 };
    campaigns.forEach((c) => {
      total.spend += c.spent;
      total.revenue += c.revenue;
      total.clicks += c.clicks;
    });
    const spentPerDay = total.spend / 7;
    const revenuePerDay = total.revenue / 7;
    const clicksPerDay = total.clicks / 7;
    return days.map((name) => ({
      name,
      revenue: Math.round(revenuePerDay * (0.7 + Math.random() * 0.6)),
      spend: Math.round(spentPerDay * (0.7 + Math.random() * 0.6)),
      clicks: Math.round(clicksPerDay * (0.7 + Math.random() * 0.6)),
    }));
  }, [campaigns]);

  const budgetData = useMemo(() => {
    const platforms = [...new Set(campaigns.map((c) => c.platform))];
    return platforms.map((p) => {
      const pc = campaigns.filter((c) => c.platform === p);
      const totalBudget = pc.reduce((s, c) => s + c.budget, 0);
      const totalSpent = pc.reduce((s, c) => s + c.spent, 0);
      return {
        name: p.charAt(0).toUpperCase() + p.slice(1),
        used: totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0,
        total: 100,
      };
    });
  }, [campaigns]);

  const totalSpend = metrics.totalSpend;
  const totalRevenue = metrics.totalRevenue;
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0.00";
  const cpa = metrics.averageCpa;
  const ctr = metrics.averageCtr;
  const conversions = metrics.totalConversions;

  const healthFactors = useMemo(() => {
    const all = campaigns;
    const avgRoas = all.length > 0 ? all.reduce((s, c) => s + c.roas, 0) / all.length : 0;
    const avgCtr = all.length > 0 ? all.reduce((s, c) => s + c.ctr, 0) / all.length : 0;
    const avgConvRate = all.length > 0 ? all.reduce((s, c) => s + (c.impressions > 0 ? (c.conversions / c.impressions) * 100 : 0), 0) / all.length : 0;
    const totalBud = all.reduce((s, c) => s + c.budget, 0);
    return [
      { label: "Budget Efficiency", value: Math.min(Math.round(totalBud > 0 ? (totalSpend / totalBud) * 100 : 0), 100), color: "bg-emerald-400" },
      { label: "CTR Performance", value: Math.min(Math.round(avgCtr * 20), 100), color: "bg-blue-400" },
      { label: "Conversion Rate", value: Math.min(Math.round(avgConvRate * 500), 100), color: "bg-purple-400" },
    ];
  }, [campaigns, totalSpend]);

  const bestCampaign = useMemo(() => {
    if (campaigns.length === 0) return null;
    return [...campaigns].sort((a, b) => b.roas - a.roas)[0];
  }, [campaigns]);

  const worstCampaign = useMemo(() => {
    if (campaigns.length === 0) return null;
    return [...campaigns].sort((a, b) => a.roas - b.roas)[0];
  }, [campaigns]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {campaigns.length === 0
              ? "Add your first campaign to see insights."
              : `Here's what's happening with your ${campaigns.length} campaigns.`}
          </p>
        </div>
        <div className="glass rounded-lg px-4 py-2 text-xs text-[#9CA3AF]">
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Spend" value={formatCurrency(totalSpend)} change={totalSpend > 0 ? `${((metrics.budgetUtilization || 0) > 50 ? "+" : "")}${(metrics.budgetUtilization || 0).toFixed(1)}% of budget` : "$0"} trend={metrics.budgetUtilization > 50 ? "up" : "down"} icon={DollarSign} />
        <MetricCard title="Total Revenue" value={formatCurrency(totalRevenue)} change={totalRevenue > 0 ? `${((totalRevenue / (totalSpend || 1) - 1) * 100).toFixed(1)}% ROAS` : "No data"} trend={totalRevenue > totalSpend ? "up" : "down"} icon={TrendingUp} />
        <MetricCard title="ROAS" value={`${roas}x`} change={metrics.averageRoas >= 1 ? "Profitable" : "Below target"} trend={metrics.averageRoas >= 1 ? "up" : "down"} icon={Target} />
        <MetricCard title="CPA" value={formatCurrency(cpa)} change={cpa > 0 ? `$${cpa.toFixed(0)} avg` : "No data"} trend={cpa > 0 && cpa < 50 ? "down" : "up"} icon={Activity} />
        <MetricCard title="CTR" value={formatPercentage(ctr)} change={ctr > 0 ? `${ctr.toFixed(1)}% avg` : "No data"} trend={ctr > 1 ? "up" : "down"} icon={MousePointerClick} />
        <MetricCard title="Conversions" value={formatCompactNumber(conversions)} change={conversions > 0 ? `${conversions} total` : "No data"} trend={conversions > 0 ? "up" : "down"} icon={Users} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Performance Overview</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Estimated weekly breakdown based on campaign data</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" /><span className="text-xs text-[#9CA3AF]">Revenue</span></div>
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" /><span className="text-xs text-[#9CA3AF]">Spend</span></div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FAFAFA", fontSize: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" fill="url(#revenueGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="spend" stroke="#22C55E" fill="url(#spendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Campaign Health</h3>
          <p className="text-xs text-[#9CA3AF] mb-6">Overall performance score</p>
          <div className="flex items-center justify-center mb-6">
            <CircularProgress value={metrics.campaignHealthScore} />
          </div>
          <div className="space-y-3">
            {healthFactors.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">{item.label}</span>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Budget Usage</h3>
          <p className="text-xs text-[#9CA3AF] mb-6">Budget utilization by platform</p>
          {budgetData.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-8">Add campaigns to see budget usage</p>
          ) : (
            <div className="space-y-5">
              {budgetData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#D1D5DB]">{item.name}</span>
                    <span className="text-white font-medium">{item.used}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-700" style={{ width: `${item.used}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-2 glass rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Top Campaigns</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Best performing campaigns by revenue</p>
          {topCampaigns.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-8">No campaigns yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Campaign</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Spend</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Revenue</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">ROAS</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((campaign, i) => (
                    <tr key={campaign.id} className={`border-b border-white/5 ${i === topCampaigns.length - 1 ? "border-none" : ""}`}>
                      <td className="py-3 text-white">{campaign.name}</td>
                      <td className="py-3 text-right text-[#D1D5DB]">{formatCurrency(campaign.spent)}</td>
                      <td className="py-3 text-right text-emerald-400 font-medium">{formatCurrency(campaign.revenue)}</td>
                      <td className="py-3 text-right text-[#D1D5DB]">{campaign.roas.toFixed(2)}x</td>
                      <td className="py-3 text-right text-[#D1D5DB]">{formatCompactNumber(campaign.clicks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Campaign Summary</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Real-time analysis based on your data</p>
            {campaigns.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Add campaigns to see insights and recommendations.</p>
            ) : (
              <div className="space-y-3 text-sm text-[#D1D5DB] leading-relaxed">
                <p>
                  You have <span className="text-white font-medium">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</span> with a total spend of{" "}
                  <span className="text-white font-medium">{formatCurrency(totalSpend)}</span> and revenue of{" "}
                  <span className="text-emerald-400 font-medium">{formatCurrency(totalRevenue)}</span>.
                  {totalSpend > 0 ? ` Blended ROAS is ${roas}x.` : ""}
                </p>
                {bestCampaign && (
                  <p>
                    <span className="text-white font-medium">Top performer:</span> "{bestCampaign.name}" on {bestCampaign.platform} has a ROAS of{" "}
                    <span className="text-emerald-400 font-medium">{bestCampaign.roas.toFixed(2)}x</span> with {formatCompactNumber(bestCampaign.clicks)} clicks.
                  </p>
                )}
                {worstCampaign && worstCampaign.roas < 1 && (
                  <p>
                    <span className="text-yellow-400 font-medium">Needs attention:</span> "{worstCampaign.name}" has a low ROAS of{" "}
                    <span className="text-yellow-400 font-medium">{worstCampaign.roas.toFixed(2)}x</span>.
                    Consider pausing or reallocating budget from this campaign.
                  </p>
                )}
                {budgetData.length > 0 && (
                  <p>
                    <span className="text-white font-medium">Budget insight:</span>{" "}
                    {budgetData.filter((b) => b.used < 50).length > 0
                      ? `${budgetData.filter((b) => b.used < 50).map((b) => b.name).join(", ")} ${budgetData.filter((b) => b.used < 50).length === 1 ? "has" : "have"} less than 50% budget utilization. Consider increasing spend.`
                      : "All platforms have good budget utilization."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
