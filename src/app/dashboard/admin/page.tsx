"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Building2,
  ShieldCheck,
  Globe,
  Settings as SettingsIcon,
  Activity,
  Search,
  Trash2,
  Save,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Link2,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "users" | "settings" | "updates";

interface SiteSettings {
  siteName: string;
  supportEmail: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialGithub: string;
  contactPhone: string;
  contactAddress: string;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  emailVerified: boolean;
  createdAt: string;
  _count: { workspaces: number };
}

interface UpdateEntry {
  id: string;
  version: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string;
}

interface StatsData {
  totalUsers: number;
  totalWorkspaces: number;
  planDistribution: { plan: string; _count: number }[];
  recentUsers: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<StatsData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editPlan, setEditPlan] = useState("");

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({ version: "", title: "", body: "" });
  const [savingUpdate, setSavingUpdate] = useState(false);

  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, settingsRes, updatesRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/updates"),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        const err = await statsRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load admin data");
      }

      const statsJson = await statsRes.json();
      const usersJson = await usersRes.json();
      const settingsJson = settingsRes.ok ? await settingsRes.json() : null;
      const updatesJson = updatesRes.ok ? await updatesRes.json() : null;

      setStats(statsJson);
      setUsers(usersJson.users);
      if (settingsJson?.settings) {
        setSettings(settingsJson.settings);
      }
      if (updatesJson?.updates) {
        setUpdates(updatesJson.updates);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateUser = async (userId: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: editRole, plan: editPlan }),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Failed to update user");
      return;
    }
    setEditingUser(null);
    fetchAll();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user and all their data?")) return;
    setDeletingUser(userId);
    const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Failed to delete user");
    }
    setDeletingUser(null);
    fetchAll();
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSavingSettings(false);
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Failed to save settings");
      return;
    }
    setSettingsSaved(true);
    setSettingsDirty(false);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const addUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUpdate(true);
    const res = await fetch("/api/admin/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateForm),
    });
    setSavingUpdate(false);
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Failed to add update");
      return;
    }
    setUpdateForm({ version: "", title: "", body: "" });
    setShowUpdateForm(false);
    fetchAll();
  };

  const deleteUpdate = async (id: string) => {
    if (!confirm("Delete this update?")) return;
    const res = await fetch(`/api/admin/updates?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Failed to delete update");
      return;
    }
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredStats = [
    { label: "Total Users", value: String(stats?.totalUsers ?? 0), icon: Users, color: "#7C3AED" },
    { label: "Workspaces", value: String(stats?.totalWorkspaces ?? 0), icon: Building2, color: "#22C55E" },
    { label: "Recent Users (30d)", value: String(stats?.recentUsers ?? 0), icon: Activity, color: "#3B82F6" },
    { label: "Plans Active", value: String(stats?.planDistribution?.length ?? 0), icon: CreditCard, color: "#F59E0B" },
  ];

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "dashboard", label: "Dashboard", icon: Activity },
    { key: "users", label: "Users", icon: Users },
    { key: "settings", label: "Site Settings", icon: SettingsIcon },
    { key: "updates", label: "Updates", icon: FileText },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              System administration, user management, site settings, and updates.
            </p>
          </div>
          <Link
            href="/dashboard/admin/payments"
            className="flex items-center gap-2 h-10 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
          >
            <DollarSign className="h-4 w-4" />
            Billing
          </Link>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex gap-1 p-1 rounded-xl bg-[#1E1E2E]/50 border border-white/10 w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-500/25"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </motion.div>

      {tab === "dashboard" && (
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-[#9CA3AF]">{s.label}</p>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: `${s.color}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </div>
              );
            })}
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Plan Distribution</h3>
            <div className="space-y-3">
              {stats?.planDistribution?.map((p) => (
                <div key={p.plan} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                  <span className="text-sm capitalize text-[#D1D5DB]">{p.plan}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 rounded-full bg-[#1F2937] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#7C3AED] transition-all"
                        style={{ width: `${(p._count / (stats?.totalUsers || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-8 text-right">{p._count}</span>
                  </div>
                </div>
              ))}
              {(!stats?.planDistribution || stats.planDistribution.length === 0) && (
                <p className="text-sm text-[#6B7280]">No users yet</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {tab === "users" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Users ({users.length})</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-9 w-48 pl-9 pr-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">User</th>
                  <th className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Role</th>
                  <th className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Plan</th>
                  <th className="text-left pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Verified</th>
                  <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Workspaces</th>
                  <th className="text-right pb-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} className={`border-b border-white/5 ${i === filteredUsers.length - 1 ? "border-none" : ""}`}>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED]/10 text-xs font-medium text-[#A78BFA]">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.name || "Unnamed"}</p>
                          <p className="text-xs text-[#6B7280]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      {editingUser === u.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="h-7 px-2 rounded bg-[#09090B] border border-white/10 text-xs text-white"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          u.role === "admin" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {editingUser === u.id ? (
                        <select
                          value={editPlan}
                          onChange={(e) => setEditPlan(e.target.value)}
                          className="h-7 px-2 rounded bg-[#09090B] border border-white/10 text-xs text-white"
                        >
                          <option value="free">free</option>
                          <option value="pro">pro</option>
                          <option value="enterprise">enterprise</option>
                        </select>
                      ) : (
                        <span className="text-xs text-[#D1D5DB] capitalize">{u.plan}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {u.emailVerified ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-[#6B7280]" />
                      )}
                    </td>
                    <td className="py-3 text-right text-[#D1D5DB]">{u._count.workspaces}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingUser === u.id ? (
                          <>
                            <button
                              onClick={() => updateUser(u.id)}
                              className="h-7 px-2 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg hover:bg-emerald-500/20"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="h-7 px-2 text-[#6B7280] text-xs rounded-lg hover:text-white"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingUser(u.id); setEditRole(u.role); setEditPlan(u.plan); }}
                              className="h-7 px-2 bg-[#7C3AED]/10 text-[#A78BFA] text-xs rounded-lg hover:bg-[#7C3AED]/20"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingUser === u.id}
                              className="h-7 px-2 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 disabled:opacity-50"
                            >
                              {deletingUser === u.id ? "..." : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#6B7280]">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "settings" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Site Settings</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Manage global site configuration</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={!settingsDirty || savingSettings}
              className="flex items-center gap-2 h-9 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/5 disabled:text-[#6B7280] text-white text-xs font-medium rounded-lg transition-all"
            >
              {savingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {settingsSaved ? "Saved!" : "Save"}
            </button>
          </div>
          {settings && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Globe className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-sm font-medium text-white">Branding</span>
              </div>
              <Field label="Site Name" icon={SettingsIcon} value={settings.siteName} onChange={(v) => { setSettings({ ...settings, siteName: v }); setSettingsDirty(true); }} />
              <Field label="Support Email" icon={Mail} value={settings.supportEmail} onChange={(v) => { setSettings({ ...settings, supportEmail: v }); setSettingsDirty(true); }} />

              <div className="flex items-center gap-3 pb-4 pt-2 border-b border-white/5">
                <Globe className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-sm font-medium text-white">Social Links</span>
              </div>
              <Field label="Twitter URL" icon={ExternalLink} value={settings.socialTwitter} onChange={(v) => { setSettings({ ...settings, socialTwitter: v }); setSettingsDirty(true); }} />
              <Field label="LinkedIn URL" icon={ExternalLink} value={settings.socialLinkedin} onChange={(v) => { setSettings({ ...settings, socialLinkedin: v }); setSettingsDirty(true); }} />
              <Field label="GitHub URL" icon={Link2} value={settings.socialGithub} onChange={(v) => { setSettings({ ...settings, socialGithub: v }); setSettingsDirty(true); }} />

              <div className="flex items-center gap-3 pb-4 pt-2 border-b border-white/5">
                <Globe className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-sm font-medium text-white">Contact</span>
              </div>
              <Field label="Phone" icon={Phone} value={settings.contactPhone} onChange={(v) => { setSettings({ ...settings, contactPhone: v }); setSettingsDirty(true); }} />
              <Field label="Address" icon={MapPin} value={settings.contactAddress} onChange={(v) => { setSettings({ ...settings, contactAddress: v }); setSettingsDirty(true); }} />
            </div>
          )}
          {!settings && <p className="text-sm text-[#6B7280]">Loading settings...</p>}
        </motion.div>
      )}

      {tab === "updates" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Changelog / Updates</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Publish product updates and release notes</p>
            </div>
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="flex items-center gap-2 h-9 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-all"
            >
              {showUpdateForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {showUpdateForm ? "Cancel" : "New Update"}
            </button>
          </div>

          {showUpdateForm && (
            <form onSubmit={addUpdate} className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Version</label>
                  <input
                    value={updateForm.version}
                    onChange={(e) => setUpdateForm({ ...updateForm, version: e.target.value })}
                    placeholder="e.g. 1.2.0"
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Title</label>
                  <input
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                    placeholder="e.g. New Analytics Dashboard"
                    className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Body (Markdown)</label>
                <textarea
                  value={updateForm.body}
                  onChange={(e) => setUpdateForm({ ...updateForm, body: e.target.value })}
                  placeholder="Describe what's new..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingUpdate}
                  className="flex items-center gap-2 h-9 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                >
                  {savingUpdate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Publish Update
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {updates.map((u) => (
              <div key={u.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10 shrink-0">
                  <FileText className="h-4 w-4 text-[#7C3AED]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#A78BFA] bg-[#7C3AED]/10 px-1.5 py-0.5 rounded">
                      v{u.version}
                    </span>
                    <span className="text-sm font-medium text-white">{u.title}</span>
                    {!u.published && (
                      <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">Draft</span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF] whitespace-pre-wrap">{u.body}</p>
                  <p className="text-[10px] text-[#6B7280] mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => deleteUpdate(u.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {updates.length === 0 && (
              <p className="text-sm text-[#6B7280] text-center py-8">No updates published yet</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function Field({ label, icon: Icon, value, onChange }: { label: string; icon: React.ComponentType<{ className?: string }>; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF] mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg bg-[#09090B] border border-white/5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED]/50"
      />
    </div>
  );
}
