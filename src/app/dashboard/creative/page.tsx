"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  History,
  PenTool,
  Type,
  AlignLeft,
  MessageSquare,
  MousePointerClick,
  Mail,
  Globe,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const platforms = [
  { id: "google", label: "Google", icon: Globe },
  { id: "meta", label: "Meta", icon: Eye },
  { id: "tiktok", label: "TikTok", icon: MessageSquare },
  { id: "taboola", label: "Taboola", icon: MousePointerClick },
];

const creativeTypes = [
  { id: "headline", label: "Headline", icon: Type },
  { id: "primary_text", label: "Primary Text", icon: AlignLeft },
  { id: "description", label: "Description", icon: AlignLeft },
  { id: "cta", label: "CTA", icon: MousePointerClick },
  { id: "email_copy", label: "Email Copy", icon: Mail },
  { id: "landing_page", label: "Landing Page", icon: Globe },
];

interface HistoryItem {
  id: string;
  type: string;
  platform: string;
  content: string;
  date: string;
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CreativeStudioPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("google");
  const [selectedType, setSelectedType] = useState("headline");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("adpilot_creative_history");
    if (stored) {
      try {
        setHistoryItems(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adpilot_creative_history", JSON.stringify(historyItems));
  }, [historyItems]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const platformLabel = platforms.find(p => p.id === selectedPlatform)?.label || selectedPlatform;
    const typeLabel = creativeTypes.find(t => t.id === selectedType)?.label || selectedType;
    try {
      const prompt = `Generate a ${typeLabel.toLowerCase()} for a ${platformLabel} ad campaign for AdPilot AI (an AI-powered marketing intelligence platform).

Target audience: Digital marketers and marketing agencies (B2B, ages 25-44).
Brand voice: Professional, confident, data-driven.
Tone: Authoritative but approachable.

${
  selectedType === "headline" ? "Generate 1 high-converting headline (max 30 characters for Google Ads, or max 40 characters for other platforms). Make it specific and benefit-driven." :
  selectedType === "primary_text" ? "Generate compelling primary text (2-3 sentences) that highlights the platform's ability to analyze campaigns, optimize budgets, and generate AI-driven insights." :
  selectedType === "description" ? "Generate a concise description (1-2 sentences, max 90 characters) that clearly communicates the value proposition." :
  selectedType === "cta" ? "Generate a click-worthy call-to-action (2-4 words) that creates urgency and drives conversions." :
  selectedType === "email_copy" ? "Generate a complete cold email (subject line + body, ~100 words) targeting a marketing director. Include personalization hooks, value proposition, and clear CTA." :
  selectedType === "landing_page" ? "Generate a landing page structure with headline, subheadline, 3 key benefits bullet points, social proof element, and CTA section." :
  "Generate compelling ad content."
}

Return ONLY the generated content, no explanations or meta-commentary.`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          provider: "openrouter",
          model: "openai/gpt-4o-mini",
        }),
      });
      const data = await response.json();
      const content = data.content;
      setGeneratedContent(content);

      setHistoryItems((prev) => [
        {
          id: generateId(),
          type: typeLabel,
          platform: platformLabel,
          content,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      // If AI fails, set a fallback message
      setGeneratedContent("Unable to generate content. Please check your OpenRouter API key and try again.");
    }
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = generatedContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => setHistoryItems([]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-white">Creative Studio</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Generate high-converting ad copy with AI in seconds.
        </p>
      </motion.div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6 min-w-0">
          <motion.div
            variants={fadeInUp}
            className="glass rounded-xl p-5"
          >
            <p className="text-sm font-medium text-white mb-3">
              Select Platform
            </p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border",
                      selectedPlatform === platform.id
                        ? "bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#A78BFA]"
                        : "bg-white/[0.02] border-white/5 text-[#9CA3AF] hover:border-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {platform.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="glass rounded-xl p-5"
          >
            <p className="text-sm font-medium text-white mb-3">
              Creative Type
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {creativeTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setGeneratedContent("");
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs transition-all border",
                      selectedType === type.id
                        ? "bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#A78BFA]"
                        : "bg-white/[0.02] border-white/5 text-[#9CA3AF] hover:border-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded-xl font-medium shadow-lg shadow-purple-500/25"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Creative
                </>
              )}
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-[#7C3AED]" />
                <h3 className="text-sm font-semibold text-white">
                  Generated Output
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {generatedContent && (
                  <>
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        "flex items-center gap-1.5 text-xs transition-colors",
                        copied
                          ? "text-emerald-400"
                          : "text-[#9CA3AF] hover:text-white"
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-[#09090B] border border-white/5 p-5 min-h-[200px]">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-[#7C3AED] animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[#9CA3AF]">
                      Generating your creative...
                    </p>
                  </div>
                </div>
              ) : !generatedContent ? (
                <div className="flex items-center justify-center h-full py-12">
                  <p className="text-sm text-[#6B7280]">
                    Select a platform and creative type, then click Generate.
                  </p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {selectedType === "email_copy" ||
                  selectedType === "landing_page" ? (
                    generatedContent.split("\n").map((line, i) => (
                      <p key={i} className="text-sm text-[#D1D5DB] whitespace-pre-wrap">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-[#D1D5DB] leading-relaxed whitespace-pre-wrap">
                      {generatedContent}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeInUp}
          className={cn(
            "w-80 shrink-0 glass rounded-xl p-5",
            !showHistory && "hidden lg:block"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-sm font-semibold text-white">
                History
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {historyItems.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-[#6B7280] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-[#9CA3AF] hover:text-white transition-colors lg:hidden"
              >
                {showHistory ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {historyItems.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-8">
              No history yet. Generate some creative to see it here.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setGeneratedContent(item.content);
                    const t = creativeTypes.find(t => t.label === item.type);
                    const p = platforms.find(p => p.label === item.platform);
                    if (t) setSelectedType(t.id);
                    if (p) setSelectedPlatform(p.id);
                  }}
                  className="w-full text-left p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-[#7C3AED] uppercase tracking-wider">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      {formatTimeAgo(item.date)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mb-1">{item.platform}</p>
                  <p className="text-xs text-[#D1D5DB] line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
