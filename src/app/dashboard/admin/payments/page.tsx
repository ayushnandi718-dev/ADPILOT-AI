"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Users, CreditCard, BarChart3, Search,
  RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, Plus, X, Trash2, Save, FileText, Activity,
  ArrowUpRight, ArrowDownRight, Ban, Zap, Calendar, Settings as SettingsIcon, ToggleLeft, ToggleRight, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

type Tab = "overview" | "transactions" | "subscriptions" | "coupons" | "settings";

interface Stats {
  totalRevenue: number; netRevenue: number; mrr: number; arr: number;
  todayRevenue: number; monthlyRevenue: number; activeSubscriptions: number;
  expiredSubscriptions: number; totalTransactions: number; pendingPayments: number;
  failedPayments: number; refundedAmount: number; totalUsers: number;
  churnRate: number; arpu: number; ltv: number; grossRevenue: number;
}

interface Plan { id: string; name: string; price: number; currency: string; billingCycle: string; maxCampaigns: number | null; maxAiQueries: number | null; maxCreatives: number | null; apiLimit: number | null; features: string; isActive: boolean; }

interface Tx { id: string; userId: string; planName: string; amount: number; currency: string; status: string; provider: string; paymentMethod: string | null; tax: number; couponCode: string | null; createdAt: string; user: { name: string | null; email: string }; refunds: any[]; }

interface Sub { id: string; userId: string; planName: string; status: string; billingCycle: string; autoRenew: boolean; currentPeriodEnd: string; createdAt: string; trialEndsAt: string | null; user: { id: string; name: string | null; email: string; plan: string }; plan: Plan | null; }

interface Coupon { id: string; code: string; type: string; value: number; maxUses: number | null; usedCount: number; minAmount: number | null; maxDiscount: number | null; expiresAt: string | null; isActive: boolean; description: string | null; }

const COLORS = ["#7C3AED", "#22C55E", "#F59E0B", "#3B82F6", "#EF4444", "#EC4899"];
const statusColors: Record<string, string> = {
  paid: "text-emerald-400 bg-emerald-500/10",
  pending: "text-yellow-400 bg-yellow-500/10",
  failed: "text-red-400 bg-red-500/10",
  cancelled: "text-[#6B7280] bg-white/5",
  refunded: "text-purple-400 bg-purple-500/10",
  processing: "text-blue-400 bg-blue-500/10",
  active: "text-emerald-400 bg-emerald-500/10",
  expired: "text-[#6B7280] bg-white/5",
  suspended: "text-red-400 bg-red-500/10",
  trialing: "text-blue-400 bg-blue-500/10",
};

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [txSearch, setTxSearch] = useState("");
  const [txStatusFilter, setTxStatusFilter] = useState("");
  const [subscriptions, setSubscriptions] = useState<Sub[]>([]);
  const [subSearch, setSubSearch] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: "", type: "percentage", value: 0, maxUses: "", minAmount: "", maxDiscount: "", expiresAt: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [editSubStatus, setEditSubStatus] = useState("");
  const [editSubPlan, setEditSubPlan] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, txRes, subRes, couponRes] = await Promise.all([
        fetch("/api/admin/billing"),
        fetch("/api/admin/billing/transactions"),
        fetch("/api/admin/billing/subscriptions"),
        fetch("/api/admin/billing/coupons"),
      ]);
      if (statsRes.ok) { const d = await statsRes.json(); setStats(d.stats); setPlans(d.plans || []); }
      if (txRes.ok) { const d = await txRes.json(); setTransactions(d.transactions || []); }
      if (subRes.ok) { const d = await subRes.json(); setSubscriptions(d.subscriptions || []); }
      if (couponRes.ok) { const d = await couponRes.json(); setCoupons(d.coupons || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateSubscription = async (id: string) => {
    const res = await fetch("/api/admin/billing/subscriptions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: editSubStatus, planName: editSubPlan }),
    });
    if (!res.ok) { alert("Failed to update"); return; }
    setEditingSub(null);
    fetchAll();
  };

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/billing/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponForm.code,
        type: couponForm.type,
        value: couponForm.value,
        maxUses: couponForm.maxUses ? parseInt(couponForm.maxUses) : null,
        minAmount: couponForm.minAmount ? parseFloat(couponForm.minAmount) : null,
        maxDiscount: couponForm.maxDiscount ? parseFloat(couponForm.maxDiscount) : null,
        expiresAt: couponForm.expiresAt || null,
        description: couponForm.description,
      }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); return; }
    setShowCouponForm(false);
    setCouponForm({ code: "", type: "percentage", value: 0, maxUses: "", minAmount: "", maxDiscount: "", expiresAt: "", description: "" });
    fetchAll();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/billing/coupons?id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const statCards = stats ? [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#7C3AED", change: `MRR: $${stats.mrr.toLocaleString()}` },
    { label: "Net Revenue", value: `$${stats.netRevenue.toLocaleString()}`, icon: TrendingUp, color: "#22C55E", change: `${stats.totalTransactions} transactions` },
    { label: "Active Subs", value: String(stats.activeSubscriptions), icon: Users, color: "#3B82F6", change: `${stats.expiredSubscriptions} expired` },
    { label: "Churn Rate", value: `${stats.churnRate}%`, icon: Activity, color: "#F59E0B", change: `ARPU: $${stats.arpu}` },
    { label: "Today", value: `$${stats.todayRevenue.toLocaleString()}`, icon: CreditCard, color: "#EC4899", change: `${stats.pendingPayments} pending` },
    { label: "ARR", value: `$${stats.arr.toLocaleString()}`, icon: BarChart3, color: "#7C3AED", change: `LTV: $${stats.ltv}` },
  ] : [];

  const filteredTx = transactions.filter(t => {
    const q = txSearch.toLowerCase();
    return (!txSearch || t.user.name?.toLowerCase().includes(q) || t.user.email.toLowerCase().includes(q) || t.id.includes(q)) &&
      (!txStatusFilter || t.status === txStatusFilter);
  });

  const filteredSubs = subscriptions.filter(s => {
    const q = subSearch.toLowerCase();
    return !subSearch || s.user.name?.toLowerCase().includes(q) || s.user.email.toLowerCase().includes(q);
  });

  // Sample chart data from stats
  const chartData = [
    { name: "Week 1", revenue: stats ? Math.round(stats.monthlyRevenue * 0.2) : 0, subs: stats ? Math.round(stats.activeSubscriptions * 0.8) : 0 },
    { name: "Week 2", revenue: stats ? Math.round(stats.monthlyRevenue * 0.25) : 0, subs: stats ? Math.round(stats.activeSubscriptions * 0.9) : 0 },
    { name: "Week 3", revenue: stats ? Math.round(stats.monthlyRevenue * 0.3) : 0, subs: stats ? stats.activeSubscriptions : 0 },
    { name: "Week 4", revenue: stats ? Math.round(stats.monthlyRevenue * 0.25) : 0, subs: stats ? Math.round(stats.activeSubscriptions * 1.1) : 0 },
  ];

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { key: "transactions" as Tab, label: "Transactions", icon: FileText },
    { key: "subscriptions" as Tab, label: "Subscriptions", icon: Users },
    { key: "coupons" as Tab, label: "Coupons", icon: CreditCard },
    { key: "settings" as Tab, label: "Payment Settings", icon: SettingsIcon },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-5 w-5 animate-spin text-[#7C3AED]" /></div>;
  }

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-white">Payments & Billing</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Manage subscriptions, transactions, and financial operations.</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex gap-1 p-1 rounded-xl bg-[#1E1E2E]/50 border border-white/10 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                active ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-500/25" : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
              )}>
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </motion.div>

      {tab === "overview" && (
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">{s.label}</p>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{s.change}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Revenue Growth (Monthly)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Subscription Growth</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="subs" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Plan Distribution</h3>
              <div className="space-y-3">
                {plans.map(p => {
                  const count = subscriptions.filter(s => s.planName === p.name).length;
                  const total = subscriptions.length || 1;
                  return (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-xs capitalize text-[#D1D5DB] w-24">{p.name}</span>
                      <div className="flex-1 h-2 mx-3 rounded-full bg-[#1F2937] overflow-hidden">
                        <div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                      <span className="text-xs text-[#6B7280] w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Payment Success Rate</h3>
              {(() => {
                const total = stats?.totalTransactions || 1;
                const paid = transactions.filter(t => t.status === "paid").length;
                const failed = transactions.filter(t => t.status === "failed").length;
                const pending = transactions.filter(t => t.status === "pending").length;
                const data = [
                  { name: "Paid", value: paid },
                  { name: "Failed", value: failed },
                  { name: "Pending", value: pending },
                ].filter(d => d.value > 0);
                return (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={180}>
                      <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {data.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-[#9CA3AF]">{d.name}</span>
                          <span className="text-white font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Financial Summary</h3>
              <div className="space-y-3">
                {[
                  { label: "Gross Revenue", value: `$${stats?.grossRevenue?.toLocaleString() || "0"}`, color: "text-emerald-400" },
                  { label: "Net Revenue", value: `$${stats?.netRevenue?.toLocaleString() || "0"}`, color: "text-emerald-400" },
                  { label: "Refunded", value: `$${stats?.refundedAmount?.toLocaleString() || "0"}`, color: "text-red-400" },
                  { label: "Pending", value: `$${((stats?.pendingPayments || 0) * 29).toLocaleString()}`, color: "text-yellow-400" },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-none">
                    <span className="text-xs text-[#9CA3AF]">{f.label}</span>
                    <span className={`text-xs font-semibold ${f.color}`}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "transactions" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Transactions ({transactions.length})</h3>
            <div className="flex items-center gap-2">
              <select value={txStatusFilter} onChange={e => setTxStatusFilter(e.target.value)}
                className="h-8 px-2 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white">
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
                <input value={txSearch} onChange={e => setTxSearch(e.target.value)}
                  className="h-8 w-44 pl-8 pr-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
                  placeholder="Search..." />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["User", "Plan", "Amount", "Status", "Provider", "Method", "Date"].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTx.slice(0, 50).map((t, i) => (
                  <tr key={t.id} className={`border-b border-white/5 ${i === Math.min(filteredTx.length - 1, 49) ? "border-none" : ""}`}>
                    <td className="py-3">
                      <p className="text-sm text-white">{t.user.name || "Unknown"}</p>
                      <p className="text-xs text-[#6B7280]">{t.user.email}</p>
                    </td>
                    <td className="py-3 text-sm text-[#D1D5DB] capitalize">{t.planName}</td>
                    <td className="py-3 text-sm font-medium text-white">${t.amount.toLocaleString()} {t.currency}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[t.status] || ""}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-[#D1D5DB] capitalize">{t.provider}</td>
                    <td className="py-3 text-xs text-[#6B7280] capitalize">{t.paymentMethod || "—"}</td>
                    <td className="py-3 text-xs text-[#6B7280]">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredTx.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-sm text-[#6B7280]">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "subscriptions" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Subscriptions ({subscriptions.length})</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
              <input value={subSearch} onChange={e => setSubSearch(e.target.value)}
                className="h-8 w-44 pl-8 pr-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
                placeholder="Search..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["User", "Plan", "Status", "Billing", "Auto Renew", "Period End", "Actions"].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((s, i) => (
                  <tr key={s.id} className={`border-b border-white/5 ${i === filteredSubs.length - 1 ? "border-none" : ""}`}>
                    <td className="py-3">
                      <p className="text-sm text-white">{s.user.name || "Unknown"}</p>
                      <p className="text-xs text-[#6B7280]">{s.user.email}</p>
                    </td>
                    <td className="py-3">
                      {editingSub === s.id ? (
                        <select value={editSubPlan} onChange={e => setEditSubPlan(e.target.value)}
                          className="h-7 px-2 rounded bg-[#09090B] border border-white/10 text-xs text-white">
                          {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                      ) : (
                        <span className="text-sm text-[#D1D5DB] capitalize">{s.planName}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {editingSub === s.id ? (
                        <select value={editSubStatus} onChange={e => setEditSubStatus(e.target.value)}
                          className="h-7 px-2 rounded bg-[#09090B] border border-white/10 text-xs text-white">
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="suspended">Suspended</option>
                          <option value="trialing">Trialing</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[s.status] || ""}`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-xs text-[#D1D5DB] capitalize">{s.billingCycle}</td>
                    <td className="py-3">
                      {s.autoRenew ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-[#6B7280]" />}
                    </td>
                    <td className="py-3 text-xs text-[#6B7280]">{new Date(s.currentPeriodEnd).toLocaleDateString()}</td>
                    <td className="py-3">
                      {editingSub === s.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => updateSubscription(s.id)}
                            className="h-7 px-2 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg hover:bg-emerald-500/20">Save</button>
                          <button onClick={() => setEditingSub(null)}
                            className="h-7 px-2 text-[#6B7280] text-xs rounded-lg hover:text-white">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingSub(s.id); setEditSubStatus(s.status); setEditSubPlan(s.planName); }}
                          className="h-7 px-2 bg-[#7C3AED]/10 text-[#A78BFA] text-xs rounded-lg hover:bg-[#7C3AED]/20">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-sm text-[#6B7280]">No subscriptions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "coupons" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Coupons ({coupons.length})</h3>
            <button onClick={() => setShowCouponForm(!showCouponForm)}
              className="flex items-center gap-2 h-8 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-all">
              {showCouponForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {showCouponForm ? "Cancel" : "New Coupon"}
            </button>
          </div>

          {showCouponForm && (
            <form onSubmit={saveCoupon} className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Code</label>
                  <input value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Type</label>
                  <select value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Value</label>
                  <input type="number" value={couponForm.value} onChange={e => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) || 0 })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Max Uses</label>
                  <input value={couponForm.maxUses} onChange={e => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Min Amount</label>
                  <input value={couponForm.minAmount} onChange={e => setCouponForm({ ...couponForm, minAmount: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Max Discount</label>
                  <input value={couponForm.maxDiscount} onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Expires At</label>
                  <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Description</label>
                  <input value={couponForm.description} onChange={e => setCouponForm({ ...couponForm, description: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280]" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 h-9 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Create Coupon
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Code", "Type", "Value", "Uses", "Max Uses", "Expires", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c, i) => (
                  <tr key={c.id} className={`border-b border-white/5 ${i === coupons.length - 1 ? "border-none" : ""}`}>
                    <td className="py-3">
                      <span className="text-xs font-mono text-[#A78BFA] bg-[#7C3AED]/10 px-1.5 py-0.5 rounded">{c.code}</span>
                    </td>
                    <td className="py-3 text-xs text-[#D1D5DB] capitalize">{c.type}</td>
                    <td className="py-3 text-sm font-medium text-white">
                      {c.type === "percentage" ? `${c.value}%` : `$${c.value}`}
                    </td>
                    <td className="py-3 text-xs text-[#D1D5DB]">{c.usedCount}</td>
                    <td className="py-3 text-xs text-[#6B7280]">{c.maxUses ?? "∞"}</td>
                    <td className="py-3 text-xs text-[#6B7280]">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3">
                      {c.isActive ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Active</span>
                      ) : (
                        <span className="text-[10px] text-[#6B7280] bg-white/5 px-1.5 py-0.5 rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="py-3">
                      <button onClick={() => deleteCoupon(c.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-sm text-[#6B7280]">No coupons created yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "settings" && (
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Payment System Under Testing</p>
              <p className="text-xs text-[#9CA3AF]">All payment providers are in test mode. Live payments are disabled until the system is activated.</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Payment Providers</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Enable/disable payment methods. Currently all providers are in test mode.</p>
            <div className="space-y-3">
              {[
                { id: "stripe", name: "Stripe", desc: "Credit/Debit cards, Apple Pay, Google Pay", available: true },
                { id: "paypal", name: "PayPal", desc: "PayPal balance, credit cards", available: true },
                { id: "razorpay", name: "Razorpay", desc: "UPI, cards, netbanking, wallets (India)", available: true },
                { id: "lemonsqueezy", name: "Lemon Squeezy", desc: "Global payments, tax handling", available: false },
                { id: "paddle", name: "Paddle", desc: "Global payments, VAT handling", available: false },
                { id: "cashfree", name: "Cashfree", desc: "UPI, cards, netbanking (India)", available: true },
              ].map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-[#7C3AED]" />
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-[#6B7280]">{p.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">Test Mode</span>
                    <span className="text-[10px] text-[#6B7280] bg-white/5 px-1.5 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Supported Currencies</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Auto-detected from user's country selection during checkout.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY", "BRL", "MXN", "SGD", "AED", "CHF", "SEK", "NOK", "NZD", "TRY", "ZAR"].map(c => (
                <div key={c} className="p-2 rounded-lg bg-[#09090B] border border-white/5 text-center">
                  <span className="text-xs font-mono text-[#D1D5DB]">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Real Payment Integration (Coming Soon)</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">The following integrations are planned and will be activated in production.</p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#09090B] border border-white/5">
                <h4 className="text-sm font-medium text-white mb-2">Architecture</h4>
                <ul className="space-y-1 text-xs text-[#9CA3AF]">
                  <li>• <span className="text-[#D1D5DB]">Country selector</span> → Auto-detect currency</li>
                  <li>• <span className="text-[#D1D5DB]">Plan selection</span> → Price conversion based on currency</li>
                  <li>• <span className="text-[#D1D5DB]">Payment provider</span> → Based on country (e.g., Razorpay for India, Stripe globally)</li>
                  <li>• <span className="text-[#D1D5DB]">Success</span> → Invoice generation, email notification, subscription activation</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
