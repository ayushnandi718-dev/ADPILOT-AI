"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Workflow,
  Plus,
  Bell,
  PauseCircle,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  ToggleLeft,
  ToggleRight,
  Zap,
  Clock,
  ArrowRight,
  Settings2,
} from "lucide-react";
import { mockAutomations } from "@/mock/automations";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const triggerLabels: Record<string, string> = {
  roas_threshold: "ROAS Threshold",
  budget_exceeded: "Budget Exceeded",
  cpa_spike: "CPA Spike",
  ctr_drop: "CTR Drop",
  schedule: "Schedule",
};

const triggerIcons: Record<string, React.ElementType> = {
  roas_threshold: Target,
  budget_exceeded: DollarSign,
  cpa_spike: TrendingUp,
  ctr_drop: TrendingDown,
  schedule: Clock,
};

const actionLabels: Record<string, string> = {
  notify: "Notify",
  pause_campaign: "Pause Campaign",
  adjust_budget: "Adjust Budget",
  generate_report: "Generate Report",
};

const actionIcons: Record<string, React.ElementType> = {
  notify: Bell,
  pause_campaign: PauseCircle,
  adjust_budget: DollarSign,
  generate_report: FileText,
};

function AutomationRuleCard({
  rule,
  onToggle,
}: {
  rule: (typeof mockAutomations)[0];
  onToggle: (id: string) => void;
}) {
  const TriggerIcon = triggerIcons[rule.trigger] || Zap;
  const ActionIcon = actionIcons[rule.action] || Settings2;

  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "glass rounded-xl p-5 transition-all duration-300",
        !rule.isActive && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              rule.isActive
                ? "bg-[#7C3AED]/10"
                : "bg-white/5"
            )}
          >
            <Zap
              className={cn(
                "h-5 w-5",
                rule.isActive ? "text-[#7C3AED]" : "text-[#6B7280]"
              )}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {rule.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggle(rule.id)}
          className="shrink-0 text-[#9CA3AF] hover:text-white transition-colors"
        >
          {rule.isActive ? (
            <ToggleRight className="h-6 w-6 text-[#7C3AED]" />
          ) : (
            <ToggleLeft className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge
          variant={
            rule.trigger === "schedule"
              ? "default"
              : rule.trigger === "roas_threshold"
              ? "warning"
              : rule.trigger === "budget_exceeded"
              ? "danger"
              : "outline"
          }
          className="flex items-center gap-1"
        >
          <TriggerIcon className="h-3 w-3" />
          {triggerLabels[rule.trigger] || rule.trigger}
        </Badge>
        <ArrowRight className="h-3 w-3 text-[#6B7280]" />
        <Badge variant="success" className="flex items-center gap-1">
          <ActionIcon className="h-3 w-3" />
          {actionLabels[rule.action] || rule.action}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <Clock className="h-3 w-3" />
          {rule.lastRun ? (
            <span>Last run: {formatRelativeTime(rule.lastRun)}</span>
          ) : (
            <span>Never run</span>
          )}
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            rule.isActive ? "text-emerald-400" : "text-[#6B7280]"
          )}
        >
          {rule.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </motion.div>
  );
}

export default function AutomationPage() {
  const [rules, setRules] = useState(mockAutomations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger: "roas_threshold",
    action: "notify",
  });

  function handleToggle(id: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  }

  function handleCreate() {
    if (!form.name.trim()) return;
    const newRule = {
      id: `auto-${Date.now()}`,
      name: form.name,
      description: form.description,
      trigger: form.trigger,
      condition: { metric: "roas", operator: "less_than", value: 2.0 },
      action: form.action,
      config: { channels: ["email", "in_app"], priority: "medium" },
      isActive: true,
      lastRun: null,
    };
    setRules((prev) => [...prev, newRule as unknown as typeof prev[0]]);
    setDialogOpen(false);
    setForm({ name: "", description: "", trigger: "roas_threshold", action: "notify" });
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Automation</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Create and manage automated workflow rules for your campaigns.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/25">
              <Plus className="h-4 w-4" />
              Create Automation
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Rule Name
                </label>
                <Input
                  placeholder="e.g. ROAS Drop Alert"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Describe what this automation does..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="flex h-20 w-full rounded-lg border border-[#1F2937] bg-[#09090B] px-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Trigger Type
                </label>
                <Select
                  value={form.trigger}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trigger: e.target.value }))
                  }
                  options={[
                    { value: "roas_threshold", label: "ROAS Threshold" },
                    { value: "budget_exceeded", label: "Budget Exceeded" },
                    { value: "cpa_spike", label: "CPA Spike" },
                    { value: "ctr_drop", label: "CTR Drop" },
                    { value: "schedule", label: "Schedule" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Condition Config
                </label>
                <div className="glass rounded-lg p-3 text-xs text-[#D1D5DB]">
                  {form.trigger === "roas_threshold" && (
                    <span>
                      Trigger when ROAS is less than a specified value
                    </span>
                  )}
                  {form.trigger === "budget_exceeded" && (
                    <span>
                      Trigger when budget utilization exceeds a percentage
                    </span>
                  )}
                  {form.trigger === "cpa_spike" && (
                    <span>
                      Trigger when CPA exceeds a multiplier of target
                    </span>
                  )}
                  {form.trigger === "ctr_drop" && (
                    <span>Trigger when CTR drops below a threshold</span>
                  )}
                  {form.trigger === "schedule" && (
                    <span>Trigger on a recurring schedule</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                  Action Type
                </label>
                <Select
                  value={form.action}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, action: e.target.value }))
                  }
                  options={[
                    { value: "notify", label: "Notify" },
                    { value: "pause_campaign", label: "Pause Campaign" },
                    { value: "adjust_budget", label: "Adjust Budget" },
                    { value: "generate_report", label: "Generate Report" },
                  ]}
                />
              </div>
              <div className="glass rounded-lg p-4 flex items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#7C3AED]/10 text-[#A78BFA]">
                  <Zap className="h-3.5 w-3.5" />
                  {triggerLabels[form.trigger] || form.trigger}
                </div>
                <ArrowRight className="h-4 w-4 text-[#6B7280]" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 text-[#D1D5DB]">
                  <Settings2 className="h-3.5 w-3.5" />
                  Condition
                </div>
                <ArrowRight className="h-4 w-4 text-[#6B7280]" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  {(() => {
                    const ActIcon = actionIcons[form.action] || Settings2;
                    return <ActIcon className="h-3.5 w-3.5" />;
                  })()}
                  {actionLabels[form.action] || form.action}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <Button onClick={handleCreate}>Create Rule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="glass rounded-xl p-4 flex items-center gap-4"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]/10">
          <Workflow className="h-4 w-4 text-[#7C3AED]" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-white font-medium">
            {rules.filter((r) => r.isActive).length} active automations
          </p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            {rules.length} total rules configured
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Activity className="h-3.5 w-3.5" />
          <span>Last checked: just now</span>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {rules.map((rule) => (
          <AutomationRuleCard
            key={rule.id}
            rule={rule}
            onToggle={handleToggle}
          />
        ))}
      </motion.div>

      {rules.length === 0 && (
        <motion.div
          variants={fadeInUp}
          className="glass rounded-xl p-12 text-center"
        >
          <Workflow className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">
            No automation rules yet
          </p>
          <p className="text-sm text-[#9CA3AF]">
            Create your first automation rule to start monitoring your campaigns.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
