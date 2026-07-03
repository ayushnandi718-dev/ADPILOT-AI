"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  ExternalLink,
  BarChart3,
  MousePointerClick,
  Target,
  Eye,
  Plus,
  X,
} from "lucide-react";
import { useCampaignStore } from "@/store/campaign-store";
import { formatCurrency, formatPercentage, formatCompactNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { checkCampaignLimit } from "@/lib/plan-limits";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const platformBadge = (platform: string) => {
  const colors: Record<string, string> = {
    google: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    meta: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    tiktok: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    taboola: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return colors[platform.toLowerCase()] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
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

const initialForm = {
  name: "",
  platform: "google",
  type: "search",
  status: "active" as string,
  budget: 0,
  spent: 0,
  impressions: 0,
  clicks: 0,
  conversions: 0,
  revenue: 0,
};

export default function CampaignsPage() {
  const { campaigns, isLoading, loadCampaigns, addCampaign } = useCampaignStore();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const calculations = useMemo(() => {
    const ctr = form.impressions > 0 ? (form.clicks / form.impressions) * 100 : 0;
    const cpa = form.conversions > 0 ? form.spent / form.conversions : 0;
    const roas = form.spent > 0 ? form.revenue / form.spent : 0;
    return { ctr, cpa, roas };
  }, [form.impressions, form.clicks, form.conversions, form.spent, form.revenue]);

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q));
    }
    if (platformFilter !== "all") result = result.filter((c) => c.platform === platformFilter);
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    result.sort((a, b) => {
      switch (sortBy) {
        case "revenue": return b.revenue - a.revenue;
        case "spend": return b.spent - a.spent;
        case "roas": return b.roas - a.roas;
        case "clicks": return b.clicks - a.clicks;
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return result;
  }, [campaigns, search, platformFilter, statusFilter, sortBy]);

  const platforms = useMemo(() => [...new Set(campaigns.map((c) => c.platform))], [campaigns]);
  const statuses = useMemo(() => [...new Set(campaigns.map((c) => c.status))], [campaigns]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const check = checkCampaignLimit(user.plan, campaigns.length);
      if (!check.allowed) {
        alert(check.message);
        return;
      }
    }
    addCampaign(form);
    setForm(initialForm);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Manage and monitor all your ad campaigns in one place.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 h-10 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/25"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New Campaign"}
        </button>
      </motion.div>

      {showForm && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Add New Campaign</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs text-[#9CA3AF] mb-1">Campaign Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Summer Sale - Google Search"
                required
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-[#D1D5DB] focus:outline-none focus:border-[#7C3AED]/50"
              >
                <option value="google">Google</option>
                <option value="meta">Meta</option>
                <option value="tiktok">TikTok</option>
                <option value="taboola">Taboola</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-[#D1D5DB] focus:outline-none focus:border-[#7C3AED]/50"
              >
                <option value="search">Search</option>
                <option value="display">Display</option>
                <option value="social">Social</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-[#D1D5DB] focus:outline-none focus:border-[#7C3AED]/50"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Budget ($)</label>
              <input
                type="number"
                min="0"
                value={form.budget || ""}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                placeholder="5000"
                required
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Spent ($)</label>
              <input
                type="number"
                min="0"
                value={form.spent || ""}
                onChange={(e) => setForm({ ...form, spent: Number(e.target.value) })}
                placeholder="3200"
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Impressions</label>
              <input
                type="number"
                min="0"
                value={form.impressions || ""}
                onChange={(e) => setForm({ ...form, impressions: Number(e.target.value) })}
                placeholder="150000"
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Clicks</label>
              <input
                type="number"
                min="0"
                value={form.clicks || ""}
                onChange={(e) => setForm({ ...form, clicks: Number(e.target.value) })}
                placeholder="4500"
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Conversions</label>
              <input
                type="number"
                min="0"
                value={form.conversions || ""}
                onChange={(e) => setForm({ ...form, conversions: Number(e.target.value) })}
                placeholder="125"
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Revenue ($)</label>
              <input
                type="number"
                min="0"
                value={form.revenue || ""}
                onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })}
                placeholder="12500"
                className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-6 p-3 rounded-lg bg-[#09090B] border border-white/5 text-sm">
                <span className="text-[#9CA3AF]">Calculated Metrics:</span>
                <span className="text-white">CTR: <span className="text-[#A78BFA]">{calculations.ctr.toFixed(2)}%</span></span>
                <span className="text-white">CPA: <span className="text-[#A78BFA]">{formatCurrency(calculations.cpa)}</span></span>
                <span className="text-white">ROAS: <span className="text-[#A78BFA]">{calculations.roas.toFixed(2)}x</span></span>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                className="h-10 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/25"
              >
                Add Campaign
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-[#D1D5DB] focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
        >
          <option value="all">All Platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-[#D1D5DB] focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-[#D1D5DB] focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="spend">Sort by Spend</option>
          <option value="roas">Sort by ROAS</option>
          <option value="clicks">Sort by Clicks</option>
          <option value="name">Sort by Name</option>
        </select>
      </motion.div>

      {filteredCampaigns.length === 0 ? (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-12 text-center">
          <BarChart3 className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">No campaigns found</p>
          <p className="text-sm text-[#9CA3AF] mb-4">
            {campaigns.length === 0 ? "Add your first campaign to get started." : "Try adjusting your filters."}
          </p>
          {campaigns.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 h-10 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium text-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Campaign
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => {
            const budgetPercent = campaign.budget > 0 ? Math.min(Math.round((campaign.spent / campaign.budget) * 100), 100) : 0;
            return (
              <motion.div key={campaign.id} variants={fadeInUp} className="relative group">
                <Link href={`/dashboard/campaigns/${campaign.id}`}>
                  <div className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                        {campaign.name}
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", platformBadge(campaign.platform))}>
                        {campaign.platform}
                      </span>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize", statusBadge(campaign.status))}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#9CA3AF]">Budget used</span>
                        <span className="text-white font-medium">{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-700" style={{ width: `${budgetPercent}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <Eye className="h-3.5 w-3.5 text-[#6B7280] mx-auto mb-0.5" />
                        <p className="text-xs text-white font-medium">{formatCompactNumber(campaign.impressions)}</p>
                        <p className="text-[10px] text-[#6B7280]">Impr.</p>
                      </div>
                      <div className="text-center">
                        <MousePointerClick className="h-3.5 w-3.5 text-[#6B7280] mx-auto mb-0.5" />
                        <p className="text-xs text-white font-medium">{formatCompactNumber(campaign.clicks)}</p>
                        <p className="text-[10px] text-[#6B7280]">Clicks</p>
                      </div>
                      <div className="text-center">
                        <Target className="h-3.5 w-3.5 text-[#6B7280] mx-auto mb-0.5" />
                        <p className="text-xs text-white font-medium">{formatPercentage(campaign.ctr)}</p>
                        <p className="text-[10px] text-[#6B7280]">CTR</p>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="h-3.5 w-3.5 text-[#6B7280] mx-auto mb-0.5" />
                        <p className="text-xs text-emerald-400 font-medium">{campaign.roas.toFixed(1)}x</p>
                        <p className="text-[10px] text-[#6B7280]">ROAS</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {campaigns.length > 0 && (
        <motion.div variants={fadeInUp} className="text-center text-xs text-[#6B7280]">
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
        </motion.div>
      )}
    </motion.div>
  );
}
