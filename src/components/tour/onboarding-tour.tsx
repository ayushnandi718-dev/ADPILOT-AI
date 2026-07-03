"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  Megaphone,
  PenTool,
  Bot,
  TrendingUp,
  Menu,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface TourStep {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    icon: Sparkles,
    title: "Welcome to AdPilot AI!",
    description:
      "Your AI-powered marketing copilot. Manage campaigns, generate creative, analyze performance, and optimize ROI — all from one dashboard.",
    color: "#7C3AED",
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Command Center",
    description:
      "The Dashboard gives you a real-time snapshot of all your campaigns — total spend, revenue, ROAS, CPA, CTR, and a campaign health score.",
    color: "#7C3AED",
  },
  {
    id: "campaigns",
    icon: Megaphone,
    title: "Manage Campaigns",
    description:
      "Add, edit, and monitor your ad campaigns. Enter budget, spend, impressions, clicks, conversions, and revenue — metrics like CTR, CPA, and ROAS are calculated instantly.",
    color: "#F59E0B",
  },
  {
    id: "creative",
    icon: PenTool,
    title: "Creative Studio",
    description:
      "Generate high-converting ad copy with AI. Pick a platform and creative type (headline, description, CTA, email), and let AI write it for you.",
    color: "#22C55E",
  },
  {
    id: "copilot",
    icon: Bot,
    title: "AI Copilot",
    description:
      "Chat with AI about your campaigns. Ask for optimization suggestions, performance analysis, or strategy recommendations.",
    color: "#3B82F6",
  },
  {
    id: "analytics",
    icon: TrendingUp,
    title: "Deep Analytics",
    description:
      "Visualize your data with charts and breakdowns. See platform distribution, channel performance, and top campaigns.",
    color: "#EC4899",
  },
  {
    id: "navigation",
    icon: Menu,
    title: "Navigate Anywhere",
    description:
      "Use the sidebar to jump between sections. You can collapse it for more screen space, and revisit this tour anytime from the bottom of the sidebar.",
    color: "#06B6D4",
  },
  {
    id: "done",
    icon: CheckCircle2,
    title: "You're Ready!",
    description:
      "Start by adding your first campaign on the Campaigns page, then watch your dashboard come to life. The AI Copilot is always here to help.",
    color: "#10B981",
  },
];

const TOUR_STORAGE_KEY = "adpilot_tour_completed";

export function useOnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const completeTour = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const dismissTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(startTour, 800);
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  return {
    isOpen,
    currentStep,
    setCurrentStep,
    startTour,
    completeTour,
    dismissTour,
    totalSteps: tourSteps.length,
  };
}

export function OnboardingTour({
  isOpen,
  currentStep,
  setCurrentStep,
  completeTour,
  dismissTour,
  totalSteps,
}: {
  isOpen: boolean;
  currentStep: number;
  setCurrentStep: (n: number) => void;
  completeTour: () => void;
  dismissTour: () => void;
  totalSteps: number;
}) {
  const step = tourSteps[currentStep];
  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismissTour}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 mx-4 w-full max-w-lg"
          >
            <div className="glass rounded-2xl p-8 border border-white/10">
              <button
                onClick={dismissTour}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:text-white hover:bg-[#1F2937] transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: `${step.color}20` }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: step.color }}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Step {currentStep + 1} of {totalSteps}
                  </p>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {step.title}
                  </h2>
                </div>
              </div>

              <p className="text-sm text-[#D1D5DB] leading-relaxed mb-8">
                {step.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {tourSteps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? "w-6 bg-[#7C3AED]"
                          : "w-1.5 bg-[#1F2937] hover:bg-[#374151]"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-all"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                  )}
                  {isLast ? (
                    <button
                      onClick={completeTour}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-all shadow-lg shadow-purple-500/25"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Get Started
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#7C3AED]/80 hover:bg-[#7C3AED] transition-all"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
