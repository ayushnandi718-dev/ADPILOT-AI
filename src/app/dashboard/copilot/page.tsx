"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ChevronDown,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Download,
  RefreshCw,
  Lightbulb,
  BarChart3,
  PenTool,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const conversations = [
  { id: "1", title: "Campaign Performance Analysis", date: "2 min ago" },
  { id: "2", title: "Q1 Budget Optimization Strategy", date: "1 hour ago" },
  { id: "3", title: "Creative A/B Test Results", date: "3 hours ago" },
  { id: "4", title: "Meta Ads vs Google Ads ROI", date: "1 day ago" },
  { id: "5", title: "TikTok Campaign Launch Plan", date: "2 days ago" },
  { id: "6", title: "Weekly Performance Report", date: "3 days ago" },
];

const suggestedPrompts = [
  {
    icon: BarChart3,
    text: "Analyze my campaign performance this week",
  },
  {
    icon: TrendingUp,
    text: "How can I improve my ROAS?",
  },
  {
    icon: PenTool,
    text: "Generate ad copy for a Google campaign",
  },
  {
    icon: Lightbulb,
    text: "Suggest budget optimization strategies",
  },
];

const modelOptions = [
  { id: "gpt4", label: "GPT-4 (Recommended)" },
  { id: "gpt35", label: "GPT-3.5 (Fast)" },
  { id: "claude", label: "Claude 3" },
];

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("# ")) {
      return (
        <p key={i} className="text-lg font-bold text-white mb-2">
          {line.slice(2)}
        </p>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <p key={i} className="text-base font-semibold text-white mb-1.5">
          {line.slice(3)}
        </p>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="text-sm font-semibold text-[#A78BFA] mb-1">
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li
          key={i}
          className="text-sm text-[#D1D5DB] ml-4 list-disc"
        >
          {line.slice(2)}
        </li>
      );
    }
    if (line.startsWith("• ")) {
      return (
        <li
          key={i}
          className="text-sm text-[#D1D5DB] ml-4 list-disc"
        >
          {line.slice(2)}
        </li>
      );
    }
    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }
    return (
      <p key={i} className="text-sm text-[#D1D5DB] leading-relaxed mb-1">
        {line}
      </p>
    );
  });
}



export default function CopilotPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentConv, setCurrentConv] = useState("1");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamDone, setStreamDone] = useState(true);
  const [model, setModel] = useState("gpt4");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const getAIResponse = async (userInput: string) => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are AdPilot AI, a marketing intelligence copilot. You help marketers analyze campaigns, optimize budgets, generate ad creative, and improve ROAS.

You have access to the following campaign data that you can reference:
- Summer Sale 2026 - Google Search: $32,450 spend, $187,500 revenue, 5.78x ROAS
- Brand Awareness - Meta: $18,200 spend, $124,600 revenue, 6.85x ROAS
- TikTok Viral Challenge: $8,900 spend, $45,360 revenue, 5.10x ROAS
- Retargeting - Display: $11,200 spend, $66,750 revenue, 5.96x ROAS
- Content Discovery - Taboola: $14,500 spend, $43,420 revenue, 2.99x ROAS (PAUSED)
- Product Launch - Meta: $22,100 spend, $115,680 revenue, 5.23x ROAS
- YouTube Pre-Roll: $15,600 spend, $82,080 revenue, 5.26x ROAS

Always provide specific, actionable advice. Use markdown formatting. Be concise but thorough. When asked to analyze, provide specific numbers and percentages. When asked for recommendations, give prioritized action items.`,
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userInput },
          ],
          provider: "openrouter",
          model: "openai/gpt-4o-mini",
        }),
      });
      const data = await response.json();
      return data.content;
    } catch {
      return "I apologize, but I'm having trouble connecting to the AI service right now. Please check your API key configuration in Settings and try again.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setHasStarted(true);
    setIsStreaming(true);
    setStreamDone(false);

    const response = await getAIResponse(userMsg);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: response },
    ]);
    setIsStreaming(false);
    setStreamDone(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (text: string) => {
    setInput(text);
  };

  const handleExport = () => {
    const text = messages
      .map(
        (m) =>
          `${m.role === "user" ? "You" : "AdPilot AI"}:\n${m.content}`
      )
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copilot-conversation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex h-[calc(100vh-8rem)] gap-0"
    >
      {/* Sidebar */}
      <div
        className={cn(
          "glass rounded-xl p-4 flex flex-col transition-all duration-300 shrink-0",
          sidebarOpen ? "w-64 mr-4" : "w-0 mr-0 overflow-hidden p-0"
        )}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-sm font-semibold text-white">Conversations</h3>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setCurrentConv(conv.id)}
              className={cn(
                "w-full text-left p-2.5 rounded-lg text-xs transition-colors",
                currentConv === conv.id
                  ? "bg-[#7C3AED]/10 text-white"
                  : "text-[#9CA3AF] hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <p className="font-medium truncate">{conv.title}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">
                {conv.date}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-[#9CA3AF] hover:text-white transition-colors"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  AI Copilot
                </h2>
                <p className="text-[10px] text-[#6B7280]">
                  {model === "gpt4"
                    ? "GPT-4"
                    : model === "gpt35"
                    ? "GPT-3.5"
                    : "Claude 3"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Model
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showModelSelector && (
                  <div className="absolute right-0 top-full mt-1 glass rounded-lg p-1.5 min-w-[160px] z-10">
                    {modelOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setModel(opt.id);
                          setShowModelSelector(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-xs transition-colors",
                          model === opt.id
                            ? "bg-[#7C3AED]/10 text-white"
                            : "text-[#9CA3AF] hover:bg-white/[0.03] hover:text-white"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 glass rounded-xl p-6 overflow-y-auto mb-4">
          {!hasStarted ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] mb-6 shadow-lg shadow-purple-500/25">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-sm text-[#9CA3AF] mb-8 max-w-md">
                Ask me anything about your campaigns, get optimization
                recommendations, or generate ad creative.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {suggestedPrompts.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-left text-sm text-[#D1D5DB] hover:bg-white/[0.06] hover:border-white/10 transition-all"
                    >
                      <Icon className="h-4 w-4 text-[#7C3AED] shrink-0" />
                      <span>{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                      msg.role === "user"
                        ? "bg-[#1F2937]"
                        : "bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-[#D1D5DB]" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-3",
                      msg.role === "user"
                        ? "bg-[#7C3AED]/10 border border-[#7C3AED]/20"
                        : "bg-white/[0.03] border border-white/5"
                    )}
                  >
                    {msg.role === "assistant" && i === messages.length - 1 && !streamDone ? (
                      <div className="prose prose-invert max-w-none">
                        {renderMarkdown(msg.content)}
                      </div>
                    ) : msg.role === "assistant" ? (
                      <div className="prose prose-invert max-w-none">
                        {renderMarkdown(msg.content)}
                      </div>
                    ) : (
                      <p className="text-sm text-[#D1D5DB] whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="glass rounded-xl p-3">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AdPilot AI anything..."
              rows={1}
              className="flex-1 min-h-[44px] max-h-32 bg-transparent text-sm text-white placeholder-[#6B7280] resize-none focus:outline-none py-2.5 px-2"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="h-10 w-10 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-30 disabled:cursor-not-allowed shrink-0 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-[#6B7280] mt-1.5 px-2">
            AdPilot AI may produce inaccurate information. Verify critical
            decisions.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
