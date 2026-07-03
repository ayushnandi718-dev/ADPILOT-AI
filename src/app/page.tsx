"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  PenTool,
  Bot,
  Workflow,
  FileText,
  ChevronRight,
  Star,
  Check,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: BarChart3,
    title: "Campaign Analytics",
    description:
      "Real-time dashboards with drill-down metrics across all your ad platforms. Track impressions, clicks, conversions, and revenue in one place.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: PenTool,
    title: "Creative Studio",
    description:
      "AI-powered ad copy generator that produces high-converting headlines, descriptions, and CTAs tailored to your brand voice.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Bot,
    title: "AI Copilot",
    description:
      "Your intelligent marketing assistant that answers questions, analyzes performance, and recommends optimization strategies.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Workflow,
    title: "Budget Optimization",
    description:
      "Machine learning algorithms that automatically reallocate budget to top-performing campaigns and audiences.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Zap,
    title: "Automation",
    description:
      "Set up triggered workflows for bid adjustments, budget caps, and creative rotation based on custom rules.",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    icon: FileText,
    title: "Reports",
    description:
      "Automated client-ready reports with beautiful visualizations. Schedule and share reports with stakeholders.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "VP of Marketing, GrowthLayer",
    content:
      "AdPilot AI transformed how we manage our ad spend. We've seen a 340% improvement in ROAS within the first month. The AI Copilot alone saves my team 20+ hours per week.",
    rating: 5,
    initials: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Head of Performance, ScaleUp Media",
    content:
      "The Creative Studio is a game-changer. We're generating and testing 10x more ad variants without increasing headcount. The copy quality is indistinguishable from our top writers.",
    rating: 5,
    initials: "MR",
  },
  {
    name: "Aisha Patel",
    role: "Director of Growth, Finova",
    content:
      "Budget optimization used to be a guessing game. Now we have machine learning models that tell us exactly where to invest. Our CPA dropped 52% across all campaigns.",
    rating: 5,
    initials: "AP",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individual marketers exploring AI-powered optimization.",
    features: [
      "1 workspace",
      "5 active campaigns",
      "Basic analytics dashboard",
      "AI Copilot (50 queries/mo)",
      "Creative Studio (10 generations/mo)",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/auth/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For growing agencies and marketing teams that need scale.",
    features: [
      "10 workspaces",
      "Unlimited campaigns",
      "Advanced analytics & reporting",
      "AI Copilot (unlimited queries)",
      "Creative Studio (unlimited generations)",
      "Budget optimization engine",
      "Automation workflows",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored pricing",
    description: "For large organizations with complex multi-platform needs.",
    features: [
      "Unlimited workspaces",
      "Custom integrations & APIs",
      "White-label reporting",
      "Dedicated account manager",
      "Custom ML model training",
      "SLA guarantees",
      "SSO & advanced security",
      "24/7 premium support",
    ],
    cta: "Talk to Sales",
    href: "#contact",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What platforms does AdPilot AI support?",
    answer:
      "AdPilot AI integrates with Google Ads, Meta Ads (Facebook/Instagram), TikTok Ads, Taboola, LinkedIn Ads, and Amazon Ads. We're continuously adding new platforms based on customer demand.",
  },
  {
    question: "How does the AI Copilot work?",
    answer:
      "Our AI Copilot is trained on millions of ad campaigns and marketing data points. You can ask it questions about campaign performance, get recommendations for optimization, generate ad copy, or analyze trends. It understands context across all your connected accounts.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption (AES-256 at rest, TLS 1.3 in transit). Your data is never used to train public models. We maintain SOC 2 compliance and support SSO/SAML for Enterprise plans.",
  },
  {
    question: "Can I try before committing to a paid plan?",
    answer:
      "Yes! The Free plan gives you full access to a limited set of features. The Pro plan comes with a 14-day free trial — no credit card required. You can cancel anytime.",
  },
  {
    question: "How long does onboarding take?",
    answer:
      "Most users are up and running within 10 minutes. Connect your ad accounts via OAuth, and AdPilot AI will start pulling data immediately. Our setup wizard guides you through the entire process.",
  },
];

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="AdPilot AI" width={40} height={40} className="h-10 w-10 rounded-xl shadow-lg shadow-purple-500/20 ring-2 ring-[#7C3AED]/30" />
              <span className="text-xl font-bold text-white tracking-tight">
                AdPilot AI
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="/auth/sign-in"
                className="text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg px-5 py-2 text-sm font-medium">
                  Get Started Free
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/5 bg-[#09090B]/95 backdrop-blur-xl"
          >
            <div className="space-y-1 px-4 py-4">
              <Link
                href="#features"
                className="block py-2 text-sm text-[#9CA3AF] hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="block py-2 text-sm text-[#9CA3AF] hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="block py-2 text-sm text-[#9CA3AF] hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="/auth/sign-in"
                className="block py-2 text-sm text-[#9CA3AF] hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button className="mt-2 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#7C3AED]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-[#9CA3AF] mb-8"
            >
              <Sparkles className="h-4 w-4 text-[#7C3AED]" />
              <span>
                AI-powered marketing intelligence platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="gradient-text">
                Your Marketing
              </span>
              <br />
              <span className="gradient-text">
                Intelligence Copilot
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl text-[#9CA3AF] leading-relaxed"
            >
              Supercharge your campaigns with AI-driven analytics, automated
              budget optimization, and a creative studio that generates
              high-converting ad copy at scale.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/sign-up">
                <Button className="h-12 px-8 text-base bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium shadow-lg shadow-purple-500/25">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  variant="outline"
                  className="h-12 px-8 text-base border border-white/10 text-[#FAFAFA] hover:bg-white/5 rounded-xl"
                >
                  See Demo
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-[#6B7280]"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                Cancel anytime
              </span>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 mx-auto max-w-5xl"
          >
            <div className="glass rounded-2xl p-2 shadow-2xl">
              <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
                <Image
                  src="/dashboard.png"
                  alt="AdPilot AI Dashboard Preview"
                  width={1280}
                  height={720}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold"
            >
              <span className="gradient-text">
                Everything you need to win
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-[#9CA3AF] max-w-2xl mx-auto"
            >
              From campaign analytics to creative generation — one platform
              that does it all.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass rounded-xl p-6 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                <div
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br mb-4 bg-[#7C3AED]/10",
                    `bg-gradient-to-br ${feature.gradient} bg-opacity-10`
                  )}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/5 via-transparent to-[#7C3AED]/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { value: 10000, suffix: "+", label: "Campaigns Optimized", icon: TrendingUp },
              { value: 500, suffix: "+", label: "Agencies Trust Us", icon: Users },
              { value: 98, suffix: "%", label: "Client Satisfaction", icon: Shield },
              { value: 2, suffix: "B+", prefix: "$", label: "Revenue Optimized", icon: Globe },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C3AED]/10 mb-4">
                  <stat.icon className="h-6 w-6 text-[#7C3AED]" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                  {stat.prefix}
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <div className="text-[#9CA3AF] text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold"
            >
              <span className="gradient-text">
                Loved by marketing teams
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-[#9CA3AF] max-w-2xl mx-auto"
            >
              See what our customers have to say about AdPilot AI.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="glass rounded-xl p-6 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map(
                    (_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                </div>
                <p className="text-sm text-[#D1D5DB] leading-relaxed flex-1 mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-sm font-semibold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold"
            >
              <span className="gradient-text">
                Simple, transparent pricing
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-[#9CA3AF] max-w-2xl mx-auto"
            >
              Start for free, upgrade when you need more power.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className={cn(
                  "glass rounded-xl p-6 sm:p-8 relative flex flex-col",
                  plan.highlighted &&
                    "ring-2 ring-[#7C3AED] scale-105 md:scale-110"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#6B7280] ml-2">
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-[#D1D5DB]"
                    >
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className={cn(
                      "w-full rounded-xl h-11 font-medium",
                      plan.highlighted
                        ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/25"
                        : "border border-white/10 text-[#FAFAFA] hover:bg-white/5"
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold"
            >
              <span className="gradient-text">
                Frequently asked questions
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm sm:text-base font-medium text-white pr-4">
                    {faq.question}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 text-[#6B7280] shrink-0 transition-transform",
                      openFaq === i && "rotate-90"
                    )}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-[#9CA3AF] leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#7C3AED]/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              <span className="gradient-text">
                Ready to transform your marketing?
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-[#9CA3AF] max-w-2xl mx-auto mb-10"
            >
              Join 500+ agencies and marketing teams already using AdPilot AI
              to optimize campaigns, generate creatives, and drive revenue at
              scale.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/sign-up">
                <Button className="h-12 px-8 text-base bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium shadow-lg shadow-purple-500/25">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#">
                <Button
                  variant="outline"
                  className="h-12 px-8 text-base border border-white/10 text-[#FAFAFA] hover:bg-white/5 rounded-xl"
                >
                  Talk to Sales
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  AdPilot AI
                </span>
              </Link>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs">
                AI-powered marketing intelligence platform for modern digital
                teams.
              </p>
            </div>
            {[
              { title: "Product", links: footerLinks.product },
              { title: "Company", links: footerLinks.company },
              { title: "Resources", links: footerLinks.resources },
              { title: "Legal", links: footerLinks.legal },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-white mb-3">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.href}
                        className="text-xs text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#6B7280]">
              &copy; {new Date().getFullYear()} AdPilot AI. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-xs text-[#6B7280] hover:text-[#9CA3AF]"
              >
                Twitter
              </Link>
              <Link
                href="#"
                className="text-xs text-[#6B7280] hover:text-[#9CA3AF]"
              >
                LinkedIn
              </Link>
              <Link
                href="#"
                className="text-xs text-[#6B7280] hover:text-[#9CA3AF]"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
