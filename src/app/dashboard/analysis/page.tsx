"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  Download,
  TrendingUp,
  Target,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Zap,
  RefreshCw,
  X,
  DollarSign,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function renderAnalysis(content: string) {
  const lines = content.split("\n");
  let inList = false;
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      inList = false;
      elements.push(
        <h4 key={key++} className="text-sm font-bold text-white mt-5 mb-2">
          {trimmed.slice(4)}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      inList = false;
      elements.push(
        <h3 key={key++} className="text-base font-bold text-white mt-6 mb-3">
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      inList = false;
      elements.push(
        <h2 key={key++} className="text-lg font-bold text-white mt-6 mb-3">
          {trimmed.slice(2)}
        </h2>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      inList = true;
      const text = trimmed.replace(/^[-•]\s*/, "");
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      const children = parts.map((p, j) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
        }
        return p;
      });
      elements.push(
        <li key={key++} className="text-sm text-[#D1D5DB] ml-5 mb-1.5 list-disc">
          {children}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      inList = false;
      const text = trimmed.replace(/^\d+\.\s*/, "");
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      const children = parts.map((p, j) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
        }
        return p;
      });
      elements.push(
        <li key={key++} className="text-sm text-[#D1D5DB] ml-5 mb-1.5 list-decimal">
          {children}
        </li>
      );
    } else if (trimmed === "") {
      if (inList) {
        inList = false;
      }
      elements.push(<div key={key++} className="h-2" />);
    } else {
      inList = false;
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const children = parts.map((p, j) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
        }
        if (p.startsWith("$") && !isNaN(parseFloat(p.slice(1)))) {
          return <span key={j} className="text-emerald-400 font-medium">{p}</span>;
        }
        return p;
      });
      elements.push(
        <p key={key++} className="text-sm text-[#D1D5DB] leading-relaxed mb-1.5">
          {children}
        </p>
      );
    }
  }
  return elements;
}

export default function AnalysisPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    cpa: number;
    campaignCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "live">("live");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeLive = async () => {
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const response = await fetch("/api/campaigns/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysisResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    }
    setAnalyzing(false);
  };

  const handleUploadAnalyze = async () => {
    if (!csvFile) return;
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setImportSummary(null);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const response = await fetch("/api/campaigns/import", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysisResult(data.analysis);
      setImportSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import & analysis failed");
    }
    setAnalyzing(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-white">Campaign Analysis</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          AI-powered analysis that finds wasted spend, prioritizes optimizations, and generates actionable recommendations.
        </p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div variants={fadeInUp} className="glass rounded-xl p-1.5 flex items-center gap-1 max-w-md">
        <button
          onClick={() => setMode("live")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "live"
              ? "bg-[#7C3AED] text-white shadow-sm"
              : "text-[#9CA3AF] hover:text-white"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Analyze Live Data
        </button>
        <button
          onClick={() => setMode("upload")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "upload"
              ? "bg-[#7C3AED] text-white shadow-sm"
              : "text-[#9CA3AF] hover:text-white"
          )}
        >
          <Upload className="h-4 w-4" />
          Upload CSV
        </button>
      </motion.div>

      {/* CSV Upload Area */}
      {mode === "upload" && (
        <motion.div variants={fadeInUp}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file && file.name.endsWith(".csv")) setCsvFile(file);
            }}
            className={cn(
              "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer",
              dragging
                ? "border-[#7C3AED] bg-[#7C3AED]/5"
                : csvFile
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-[#1F2937] hover:border-[#7C3AED]/50"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {csvFile ? (
              <div className="flex items-center justify-center gap-4">
                <FileSpreadsheet className="h-10 w-10 text-emerald-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{csvFile.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCsvFile(null); setAnalysisResult(null); setImportSummary(null); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-[#6B7280] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-[#6B7280] mx-auto mb-4" />
                <p className="text-sm text-white font-medium mb-1">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  Expected columns: name, platform, spend, revenue, impressions, clicks, conversions, budget
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setCsvFile(f); }}
            />
          </div>
        </motion.div>
      )}

      {/* Analyze Button */}
      <motion.div variants={fadeInUp}>
        <Button
          onClick={mode === "live" ? handleAnalyzeLive : handleUploadAnalyze}
          disabled={analyzing || (mode === "upload" && !csvFile)}
          size="lg"
          className="w-full h-14 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 text-base"
        >
          {analyzing ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              AI Analyzing Campaigns...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {mode === "live" ? "Analyze All Campaigns with AI" : "Upload & Analyze with AI"}
            </>
          )}
        </Button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-4 border border-red-500/20 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Analysis Error</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Import Summary */}
      {importSummary && (
        <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Campaigns Imported", value: importSummary.campaignCount, icon: FileSpreadsheet, color: "text-[#7C3AED]" },
            { label: "Total Spend", value: `$${(importSummary.totalSpend / 1000).toFixed(1)}K`, icon: DollarSign, color: "text-emerald-400" },
            { label: "Total Revenue", value: `$${(importSummary.totalRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, color: "text-blue-400" },
            { label: "Blended ROAS", value: `${importSummary.roas.toFixed(2)}x`, icon: Target, color: "text-[#A78BFA]" },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeInUp} className="glass rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#7C3AED]" />
              <h2 className="text-base font-semibold text-white">
                AI Analysis Results
              </h2>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([analysisResult], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `campaign-analysis-${Date.now()}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
          <div className="rounded-xl bg-[#09090B] border border-white/5 p-5 max-h-[600px] overflow-y-auto">
            {renderAnalysis(analysisResult)}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!analysisResult && !analyzing && !error && mode === "live" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] mx-auto mb-5 shadow-lg shadow-purple-500/25">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            AI-Powered Campaign Analysis
          </h2>
          <p className="text-sm text-[#9CA3AF] max-w-lg mx-auto mb-6">
            Click the button above to analyze all your active campaigns. AdPilot AI will identify wasted spend, top opportunities, and generate a prioritized action plan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { icon: AlertTriangle, label: "Find Wasted Spend", desc: "Detect underperforming campaigns draining your budget" },
              { icon: Lightbulb, label: "Discover Opportunities", desc: "Identify high-potential campaigns to scale" },
              { icon: ArrowRight, label: "Get Action Plan", desc: "Receive prioritized, specific recommendations" },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center">
                <item.icon className="h-6 w-6 text-[#7C3AED] mx-auto mb-2" />
                <p className="text-xs font-medium text-white">{item.label}</p>
                <p className="text-[10px] text-[#6B7280] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!analysisResult && !analyzing && !error && mode === "upload" && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-10 text-center">
          <FileSpreadsheet className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-sm text-[#9CA3AF]">
            Upload a CSV file with your campaign data, and AdPilot AI will analyze it for wasted spend, optimization opportunities, and actionable recommendations.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
