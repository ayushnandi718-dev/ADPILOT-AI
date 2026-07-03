"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Layers,
  Eye,
  Trash2,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCampaignStore } from "@/store/campaign-store";
import type { CampaignData } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const reportTypeCards = [
  {
    id: "weekly",
    title: "Weekly Report",
    description: "7-day performance snapshot with key metrics and trends",
    icon: Calendar,
    color: "#7C3AED",
  },
  {
    id: "monthly",
    title: "Monthly Report",
    description: "Comprehensive monthly analysis with channel breakdowns",
    icon: BarChart3,
    color: "#22C55E",
  },
  {
    id: "campaign_summary",
    title: "Campaign Summary",
    description: "Deep dive into individual campaign performance",
    icon: TrendingUp,
    color: "#F59E0B",
  },
  {
    id: "performance_breakdown",
    title: "Performance Breakdown",
    description: "Cross-platform comparison with competitive analysis",
    icon: Layers,
    color: "#EF4444",
  },
];

interface SavedReport {
  id: string;
  name: string;
  type: string;
  status: "completed" | "generating" | "draft";
  createdAt: string;
  summary: string;
  metrics: {
    totalSpend: number;
    totalRevenue: number;
    totalConversions: number;
    totalClicks: number;
    totalImpressions: number;
    avgRoas: number;
    avgCpa: number;
    avgCtr: number;
    campaignCount: number;
  };
}

const typeIcons: Record<string, React.ElementType> = {
  weekly: Calendar,
  monthly: PieChart,
  campaign_summary: TrendingUp,
  performance_breakdown: Layers,
};

const statusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return { variant: "success" as const, icon: CheckCircle2, label: "Completed" };
    case "generating":
      return { variant: "warning" as const, icon: Loader2, label: "Generating" };
    case "draft":
      return { variant: "outline" as const, icon: AlertCircle, label: "Draft" };
    default:
      return { variant: "outline" as const, icon: FileText, label: status };
  }
};

function computeMetrics(campaigns: CampaignData[]) {
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
    avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
    avgCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    campaignCount: campaigns.length,
  };
}

function generateReportSummary(type: string, metrics: ReturnType<typeof computeMetrics>) {
  const { totalSpend, totalRevenue, totalConversions, totalClicks, avgRoas, avgCpa, avgCtr, campaignCount } = metrics;
  switch (type) {
    case "weekly":
      return `Weekly overview: ${campaignCount} campaigns, $${totalSpend.toLocaleString()} spend, $${totalRevenue.toLocaleString()} revenue, ${avgRoas.toFixed(2)}x ROAS.`;
    case "monthly":
      return `Monthly analysis: ${campaignCount} campaigns across platforms. Total conversions: ${totalConversions}, avg CTR: ${avgCtr.toFixed(2)}%, avg CPA: $${avgCpa.toFixed(2)}.`;
    case "campaign_summary":
      return `Campaign performance: ${totalClicks} clicks, ${totalConversions} conversions at $${avgCpa.toFixed(2)} CPA with ${avgRoas.toFixed(2)}x ROAS.`;
    case "performance_breakdown":
      return `Cross-platform breakdown: ${campaignCount} campaigns, blended ROAS ${avgRoas.toFixed(2)}x, total revenue $${totalRevenue.toLocaleString()}.`;
    default:
      return `Report covering ${campaignCount} campaigns.`;
  }
}

export default function ReportsPage() {
  const { campaigns } = useCampaignStore();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("adpilot_reports");
    if (stored) {
      try {
        setReports(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adpilot_reports", JSON.stringify(reports));
  }, [reports]);

  function handleGenerateReport(typeId: string) {
    const card = reportTypeCards.find((c) => c.id === typeId);
    if (!card) return;
    const metrics = computeMetrics(campaigns);
    const newReport: SavedReport = {
      id: `rpt-${generateId().slice(0, 8)}`,
      name: `${card.title} - ${new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
      type: typeId,
      status: "generating",
      createdAt: new Date().toISOString(),
      summary: generateReportSummary(typeId, metrics),
      metrics,
    };
    setReports((prev) => [newReport, ...prev]);
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === newReport.id ? { ...r, status: "completed" } : r
        )
      );
    }, 2000);
  }

  function handleDelete(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = selectedType
    ? reports.filter((r) => r.type === selectedType)
    : reports;

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
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Generate and download performance reports for your campaigns.
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <h2 className="text-sm font-semibold text-white mb-3">
          Generate Report
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypeCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => handleGenerateReport(card.id)}
                className="glass rounded-xl p-5 text-left hover:bg-white/[0.04] transition-all group text-start"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg mb-3"
                  style={{ background: `${card.color}15` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: card.color }}
                  />
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-1 mb-4">
                  {card.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[#7C3AED] font-medium">
                  <Plus className="h-3 w-3" />
                  Generate
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">
            Recent Reports
          </h2>
          <div className="flex items-center gap-2">
            {["all", "weekly", "monthly", "campaign_summary", "performance_breakdown"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedType(type === "all" ? null : type)
                  }
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                    (selectedType === null && type === "all") ||
                      selectedType === type
                      ? "bg-[#7C3AED] text-white"
                      : "text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]"
                  )}
                >
                  {type === "all"
                    ? "All"
                    : type === "campaign_summary"
                    ? "Campaign"
                    : type === "performance_breakdown"
                    ? "Breakdown"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map((report) => {
            const TypeIcon = typeIcons[report.type] || FileText;
            const statusInfo = statusBadge(report.status);
            const StatusIcon = statusInfo.icon;
            return (
              <motion.div
                key={report.id}
                variants={fadeInUp}
                className="glass rounded-xl p-4 flex items-start gap-4 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 shrink-0 mt-0.5">
                  <TypeIcon className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-white truncate">
                      {report.name}
                    </h3>
                    <Badge
                      variant={statusInfo.variant}
                      className="flex items-center gap-1 capitalize"
                    >
                      {report.status === "generating" ? (
                        <StatusIcon className="h-3 w-3 animate-spin" />
                      ) : (
                        <StatusIcon className="h-3 w-3" />
                      )}
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-1">
                    <span className="capitalize">
                      {report.type.replace("_", " ")}
                    </span>
                    <span>{formatDate(report.createdAt)}</span>
                    <span>{report.metrics.campaignCount} campaign{report.metrics.campaignCount !== 1 ? "s" : ""}</span>
                  </div>
                  {report.status === "completed" && (
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                      {report.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-1">
                  {report.status === "completed" && (
                    <>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-all">
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-all">
                        <Download className="h-3 w-3" />
                        PDF
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1F2937] text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {reports.length === 0 && (
        <motion.div
          variants={fadeInUp}
          className="glass rounded-xl p-12 text-center"
        >
          <FileText className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">
            No reports yet
          </p>
          <p className="text-sm text-[#9CA3AF]">
            Generate your first report to see it here.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
