"use client";

import { motion } from "framer-motion";
import { Check, X, AlertTriangle, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { getPlanLimits } from "@/lib/plan-limits";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals getting started",
    features: [
      { text: "Up to 5 campaigns", included: true },
      { text: "50 AI queries/month", included: true },
      { text: "10 creative generations/month", included: true },
      { text: "Basic analytics", included: true },
      { text: "Email support", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    period: "per month",
    description: "For freelancers & small projects",
    features: [
      { text: "Up to 20 campaigns", included: true },
      { text: "200 AI queries/month", included: true },
      { text: "50 creative generations/month", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Email support", included: true },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "For serious marketers & small teams",
    popular: true,
    features: [
      { text: "Unlimited campaigns", included: true },
      { text: "Unlimited AI queries", included: true },
      { text: "Unlimited creative generations", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Email support", included: true },
      { text: "Priority support", included: false },
      { text: "API access", included: true },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$79",
    period: "per month",
    description: "For growing agencies & teams",
    features: [
      { text: "Unlimited everything", included: true },
      { text: "20,000 API calls/month", included: true },
      { text: "Priority support", included: true },
      { text: "Custom integrations", included: true },
      { text: "Team accounts (5)", included: true },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    period: "per month",
    description: "For large organizations",
    features: [
      { text: "Unlimited everything", included: true },
      { text: "Unlimited API calls", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom development", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Team accounts (unlimited)", included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const currentPlan = user?.plan || "free";
  const limits = getPlanLimits(currentPlan);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Under Testing Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
        <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-400">Payment System Under Testing</p>
          <p className="text-xs text-[#9CA3AF]">All payment flows are currently in test mode. No real charges will be processed until the system goes live.</p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          You are currently on the <span className="text-[#7C3AED] font-semibold capitalize">{currentPlan}</span> plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const planKey = plan.id === "free" ? "free" : plan.id === "starter" ? "starter" : plan.id === "professional" ? "pro" : plan.id === "business" ? "business" : "enterprise";
          const isSame = planKey === currentPlan;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-5 transition-all flex flex-col ${
                plan.popular
                  ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-lg shadow-purple-500/10"
                  : "border-white/10 bg-[#1E1E2E]/50"
              } ${isSame ? "ring-2 ring-[#7C3AED]" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#7C3AED] text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                <p className="text-xs text-[#9CA3AF] mt-1">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-[#9CA3AF] ml-1">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    {feature.included ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                    )}
                    <span className={feature.included ? "text-[#D1D5DB]" : "text-[#6B7280]"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <button
                  disabled={isSame}
                  className={`w-full h-10 rounded-xl text-xs font-medium transition-all ${
                    isSame
                      ? "bg-white/5 text-[#6B7280] cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  {isSame ? "Current Plan" : "Downgrade"}
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/dashboard/subscription/checkout?plan=${plan.id}`)}
                  className={`w-full h-10 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    isSame
                      ? "bg-white/5 text-[#6B7280] cursor-not-allowed"
                      : plan.popular
                      ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/25"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  {isSame ? "Current Plan" : (
                    <><ShoppingCart className="h-3.5 w-3.5" /> Subscribe</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#1E1E2E]/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Usage This Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-[#9CA3AF]">Campaigns</p>
            <p className="text-xl font-bold text-white mt-1">
              {limits.maxCampaigns === Infinity ? "Unlimited" : `${limits.maxCampaigns} max`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-[#9CA3AF]">AI Queries</p>
            <p className="text-xl font-bold text-white mt-1">
              {limits.maxAiQueries === Infinity ? "Unlimited" : `${limits.maxAiQueries}/mo`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-[#9CA3AF]">Creative Generations</p>
            <p className="text-xl font-bold text-white mt-1">
              {limits.maxCreativeGenerations === Infinity ? "Unlimited" : `${limits.maxCreativeGenerations}/mo`}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
