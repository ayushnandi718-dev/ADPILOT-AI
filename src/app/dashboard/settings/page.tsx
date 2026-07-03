"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Cpu,
  Bell,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Mail,
  Shield,
  Loader2,
  X,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar, avatarGradients } from "@/components/ui/avatar";
import { getAvatarGradientIndex, getNextGradientIndex } from "@/lib/avatar-utils";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function SettingsPage() {
  const { user, updateProfile, deleteAccount, sendVerificationEmail } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [workspace, setWorkspace] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem("adpilot_workspace");
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {
      name: "AdPilot AI",
      slug: "adpilot-ai",
      timezone: "America/New_York",
      currency: "USD",
    };
  });

  useEffect(() => {
    localStorage.setItem("adpilot_workspace", JSON.stringify(workspace));
  }, [workspace]);

  const [aiConfig, setAiConfig] = useState({
    provider: "openrouter",
    apiKey: "",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o",
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("adpilot_notifications");
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {
      emailAlerts: true,
      pushNotifications: true,
      weeklyDigest: false,
      campaignUpdates: true,
      systemAnnouncements: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("adpilot_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const [avatarIndex, setAvatarIndex] = useState(() =>
    user ? getAvatarGradientIndex(user.name, user.email) : 0
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleSaveProfile() {
    setError("");
    setPasswordError("");
    setSaving(true);
    const update: { name?: string; email?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string } = {};
    if (name !== user?.name) update.name = name;
    if (email !== user?.email) {
      if (!currentPassword) {
        setPasswordError("Enter your current password to change email");
        setSaving(false);
        return;
      }
      update.email = email;
    }
    const currentGradient = `gradient:${avatarIndex}`;
    if (currentGradient !== user?.avatarUrl) update.avatarUrl = currentGradient;
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters");
        setSaving(false);
        return;
      }
      update.currentPassword = currentPassword;
      update.newPassword = newPassword;
    }
    if (Object.keys(update).length > 0) {
      const result = await updateProfile(update);
      if (result.error) {
        setError(result.error);
        setPasswordError(result.error);
      } else {
        setCurrentPassword("");
        setNewPassword("");
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 max-w-3xl">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Manage your account, workspace, and application preferences.</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex items-center gap-3 p-4 rounded-xl bg-[#1E1E2E]/50 border border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
          <CreditCard className="h-4 w-4 text-[#7C3AED]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            {user?.plan === "free" ? "Free Plan" : `${user?.plan?.charAt(0).toUpperCase()}${user?.plan?.slice(1)} Plan`}
          </p>
          <p className="text-xs text-[#9CA3AF]">Manage your subscription</p>
        </div>
        <Link
          href="/dashboard/subscription"
          className="h-8 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1"
        >
          {user?.plan === "free" ? "Upgrade" : "Manage"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
            <User className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Profile</h2>
            <p className="text-xs text-[#9CA3AF]">Your personal information</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <Avatar name={user?.name} email={user?.email} gradientIndex={avatarIndex} size="xl" />
            <button
              onClick={() => setAvatarIndex(getNextGradientIndex(avatarIndex))}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1F2937] border border-[#374151] text-[#9CA3AF] hover:text-white hover:bg-[#374151] transition-all opacity-0 group-hover:opacity-100"
              title="Change avatar style"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name || "User"}</p>
            <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Hover avatar and click refresh to change style</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {email !== user?.email && (
              <p className="text-xs text-[#F59E0B] mt-1">Current password required to save email change.</p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
            <Mail className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Email Verification</h2>
            <p className="text-xs text-[#9CA3AF]">Verify your email address to enable all features</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-[#111827] border border-[#1F2937]">
          <div className="flex items-center gap-3">
            {user?.emailVerified ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <Shield className="h-5 w-5 text-[#F59E0B]" />
            )}
            <div>
              <p className="text-sm text-white font-medium">
                {user?.emailVerified ? "Verified" : "Not verified"}
              </p>
              <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
            </div>
          </div>
          {!user?.emailVerified && (
            <button
              onClick={async () => {
                setSendingVerification(true);
                const result = await sendVerificationEmail();
                if (!result.error) setVerificationSent(true);
                setSendingVerification(false);
                setTimeout(() => setVerificationSent(false), 5000);
              }}
              disabled={sendingVerification}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-xs font-medium text-[#A78BFA] hover:bg-[#7C3AED]/20 transition-all disabled:opacity-50"
            >
              {sendingVerification ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              {verificationSent ? "Sent!" : "Send verification"}
            </button>
          )}
        </div>
        {verificationSent && (
          <p className="mt-2 text-xs text-emerald-400">Verification email sent! Check your inbox.</p>
        )}
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
            <RefreshCw className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Change Password</h2>
            <p className="text-xs text-[#9CA3AF]">Update your account password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Current Password</label>
            <Input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">New Password</label>
            <Input type="password" placeholder="Enter new password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </div>
        {passwordError && (
          <p className="mt-3 text-xs text-red-400">{passwordError}</p>
        )}
        {(currentPassword || newPassword) && (
          <p className="mt-2 text-xs text-[#6B7280]">
            Password will be updated when you click Save Changes.
          </p>
        )}
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
            <Building2 className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Workspace Settings</h2>
            <p className="text-xs text-[#9CA3AF]">Configure your workspace preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Workspace Name</label>
            <Input value={workspace.name} onChange={(e) => setWorkspace((w) => ({ ...w, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Workspace Slug</label>
            <Input value={workspace.slug} onChange={(e) => setWorkspace((w) => ({ ...w, slug: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Timezone</label>
            <Select
              value={workspace.timezone}
              onChange={(e) => setWorkspace((w) => ({ ...w, timezone: e.target.value }))}
              options={[
                { value: "America/New_York", label: "Eastern Time (EST)" },
                { value: "America/Chicago", label: "Central Time (CST)" },
                { value: "America/Denver", label: "Mountain Time (MST)" },
                { value: "America/Los_Angeles", label: "Pacific Time (PST)" },
                { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
                { value: "Europe/Berlin", label: "Central European Time (CET)" },
                { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Currency</label>
            <Select
              value={workspace.currency}
              onChange={(e) => setWorkspace((w) => ({ ...w, currency: e.target.value }))}
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "JPY", label: "JPY (¥)" },
                { value: "INR", label: "INR (₹)" },
              ]}
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
            <Cpu className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Model Configuration</h2>
            <p className="text-xs text-[#9CA3AF]">Configure the AI provider for Copilot features</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">AI Provider</label>
            <Select
              value={aiConfig.provider}
              onChange={(e) => setAiConfig((c) => ({ ...c, provider: e.target.value }))}
              options={[
                { value: "openrouter", label: "OpenRouter" },
                { value: "ollama", label: "Ollama (Local)" },
                { value: "lmstudio", label: "LM Studio" },
                { value: "custom", label: "Custom OpenAI Compatible" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Model Name</label>
            <Input
              value={aiConfig.model}
              onChange={(e) => setAiConfig((c) => ({ ...c, model: e.target.value }))}
              placeholder="e.g. openai/gpt-4o"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">API Key</label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={aiConfig.apiKey}
                onChange={(e) => setAiConfig((c) => ({ ...c, apiKey: e.target.value }))}
                placeholder="sk-..."
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Base URL</label>
            <Input
              value={aiConfig.baseUrl}
              onChange={(e) => setAiConfig((c) => ({ ...c, baseUrl: e.target.value }))}
              placeholder="https://api.openai.com/v1"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
            <Bell className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Notification Preferences</h2>
            <p className="text-xs text-[#9CA3AF]">Choose what notifications you receive</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: "emailAlerts" as const, label: "Email Alerts", desc: "Receive important alerts via email" },
            { key: "pushNotifications" as const, label: "Push Notifications", desc: "In-app and browser notifications" },
            { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Weekly performance summary email" },
            { key: "campaignUpdates" as const, label: "Campaign Updates", desc: "Status changes and milestone alerts" },
            { key: "systemAnnouncements" as const, label: "System Announcements", desc: "Product updates and maintenance notices" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-[#9CA3AF]">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications[item.key] ? "bg-[#7C3AED]" : "bg-[#1F2937]"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    notifications[item.key] ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                  style={{ left: 0 }}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Danger Zone</h2>
            <p className="text-xs text-[#9CA3AF]">Irreversible actions for your account</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5">
          <div>
            <p className="text-sm font-medium text-white">Delete Account</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Permanently delete your account and all associated data.</p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="shrink-0 flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>

        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm font-medium text-red-400 mb-3">
              This action cannot be undone. All your campaigns, data, and account information will be permanently deleted.
            </p>
            {deleteError && (
              <p className="text-xs text-red-400 mb-2">{deleteError}</p>
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Enter your password to confirm
                </label>
                <Input
                  type="password"
                  placeholder="Current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
              <Button
                variant="destructive"
                onClick={async () => {
                  setDeleteError("");
                  if (!deletePassword) {
                    setDeleteError("Password is required");
                    return;
                  }
                  setDeleting(true);
                  const result = await deleteAccount(deletePassword);
                  if (result.error) {
                    setDeleteError(result.error);
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="flex items-center gap-1.5"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleting ? "Deleting..." : "Confirm Delete"}
              </Button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] hover:text-white transition-all"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={fadeInUp} className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved
          </div>
        )}
        <Button onClick={handleSaveProfile} disabled={saving} size="lg" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
