"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  MousePointerClick,
  Users,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  Legend,
} from "recharts";
import { useCampaignStore } from "@/store/campaign-store";
import { formatCurrency, formatPercentage, formatCompactNumber } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const COLORS = ["#4285F4", "#1877F2", "#000000", "#E71D36", "#FF6B35"];

function MetricCard({ title, value, change, trend, icon: Icon }: {
  title: string; value: string; change: string; trend: "up" | "down"; icon: React.ElementType;
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

export default function AnalyticsPage() {
  const { campaigns } = useCampaignStore();

  const totals = useMemo(() => {
    const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    return {
      totalSpend,
      totalRevenue,
      totalConversions,
      totalClicks,
      totalImpressions,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
      roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
    };
  }, [campaigns]);

  const platformBreakdown = useMemo(() => {
    const platforms = [...new Set(campaigns.map((c) => c.platform))];
    const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);
    return platforms.map((p, i) => {
      const spend = campaigns.filter((c) => c.platform === p).reduce((s, c) => s + c.spent, 0);
      return {
        name: p.charAt(0).toUpperCase() + p.slice(1),
        value: totalSpend > 0 ? Math.round((spend / totalSpend) * 100) : 0,
        color: COLORS[i % COLORS.length],
      };
    });
  }, [campaigns]);

  const channelPerformance = useMemo(() => {
    const platforms = [...new Set(campaigns.map((c) => c.platform))];
    return platforms.map((p) => {
      const pc = campaigns.filter((c) => c.platform === p);
      return {
        channel: p.charAt(0).toUpperCase() + p.slice(1),
        revenue: pc.reduce((s, c) => s + c.revenue, 0),
        spend: pc.reduce((s, c) => s + c.spent, 0),
      };
    });
  }, [campaigns]);

  const topCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [campaigns]);

  const weeklyData = useMemo(() => {
    const total = { spend: 0, revenue: 0, clicks: 0, impressions: 0, conversions: 0 };
    campaigns.forEach((c) => {
      total.spend += c.spent;
      total.revenue += c.revenue;
      total.clicks += c.clicks;
      total.impressions += c.impressions;
      total.conversions += c.conversions;
    });
    const days = 7;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const date = `${d.getMonth() + 1}/${d.getDate()}`;
      const mult = 0.7 + Math.random() * 0.6;
      return {
        date,
        spend: Math.round((total.spend / days) * mult),
        revenue: Math.round((total.revenue / days) * mult),
        clicks: Math.round((total.clicks / days) * mult),
        impressions: Math.round((total.impressions / days) * mult),
        conversions: Math.round((total.conversions / days) * mult),
        ctr: 0,
        cpa: 0,
        roas: 0,
      };
    });
  }, [campaigns]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {campaigns.length === 0 ? "Add campaigns to see performance metrics." : `Deep dive into your ${campaigns.length} campaigns.`}
          </p>
        </div>
        <div className="glass rounded-lg px-4 py-2 text-xs text-[#9CA3AF]">
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Spend" value={formatCurrency(totals.totalSpend)} change={totals.totalSpend > 0 ? "All time" : "No data"} trend="up" icon={DollarSign} />
        <MetricCard title="Revenue" value={formatCurrency(totals.totalRevenue)} change={totals.totalRevenue > 0 ? "All time" : "No data"} trend={totals.totalRevenue > totals.totalSpend ? "up" : "down"} icon={TrendingUp} />
        <MetricCard title="ROAS" value={`${totals.roas.toFixed(2)}x`} change={totals.roas >= 1 ? "Profitable" : "Below target"} trend={totals.roas >= 1 ? "up" : "down"} icon={Target} />
        <MetricCard title="CPA" value={formatCurrency(totals.avgCpa)} change={totals.avgCpa > 0 ? "Per conversion" : "No data"} trend={totals.avgCpa > 0 && totals.avgCpa < 50 ? "down" : "up"} icon={Activity} />
        <MetricCard title="CTR" value={formatPercentage(totals.avgCtr)} change={totals.avgCtr > 0 ? "Avg rate" : "No data"} trend={totals.avgCtr > 1 ? "up" : "down"} icon={MousePointerClick} />
        <MetricCard title="Conversions" value={formatCompactNumber(totals.totalConversions)} change={totals.totalConversions > 0 ? "Total" : "No data"} trend={totals.totalConversions > 0 ? "up" : "down"} icon={Users} />
      </motion.div>

      {campaigns.length === 0 ? (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-12 text-center">
          <Activity className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">No campaign data yet</p>
          <p className="text-sm text-[#9CA3AF]">Add campaigns in the Campaigns section to see analytics.</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={fadeInUp} className="lg:col-span-2 glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Spend & Revenue</h3>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Estimated daily breakdown</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" /><span className="text-xs text-[#9CA3AF]">Revenue</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" /><span className="text-xs text-[#9CA3AF]">Spend</span></div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FAFAFA", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#7C3AED" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                    <Area type="monotone" dataKey="spend" stroke="#22C55E" fill="url(#spendGrad)" strokeWidth={2} name="Spend" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-1">Platform Split</h3>
              <p className="text-xs text-[#9CA3AF] mb-4">Spend by platform</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={platformBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {platformBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FAFAFA", fontSize: "12px" }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {platformBreakdown.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-[#D1D5DB]">{p.name}</span>
                    </div>
                    <span className="text-white font-medium">{p.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-1">Channel Performance</h3>
            <p className="text-xs text-[#9CA3AF] mb-6">Revenue and spend by platform</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={channelPerformance} barGap={8} barCategoryGap={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="channel" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FAFAFA", fontSize: "12px" }} formatter={(value) => formatCurrency(Number(value) || 0)} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spend" name="Spend" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Top Campaigns</h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Best performing by revenue</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Campaign</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Spend</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Revenue</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">ROAS</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Conversions</th>
                    <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((campaign, i) => (
                    <tr key={campaign.id} className={`border-b border-white/5 ${i === topCampaigns.length - 1 ? "border-none" : ""}`}>
                      <td className="py-3.5 text-white font-medium">{campaign.name}</td>
                      <td className="py-3.5 text-right text-[#D1D5DB]">{formatCurrency(campaign.spent)}</td>
                      <td className="py-3.5 text-right text-emerald-400 font-medium">{formatCurrency(campaign.revenue)}</td>
                      <td className="py-3.5 text-right text-[#D1D5DB]">{campaign.roas.toFixed(2)}x</td>
                      <td className="py-3.5 text-right text-[#D1D5DB]">{formatCompactNumber(campaign.conversions)}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-medium">{campaign.roas > 1 ? "+Profitable" : "−Losing"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
