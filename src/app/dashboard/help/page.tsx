"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Globe,
  Eye,
  MessageSquare,
  MousePointerClick,
  Users,
  Mail,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface HelpSection {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  steps: { label: string; content: string }[];
  tips?: string[];
  prerequisites?: string[];
}

const helpSections: HelpSection[] = [
  {
    id: "google-ads",
    icon: Globe,
    title: "Google Ads Setup",
    color: "#4285F4",
    prerequisites: [
      "A Google Ads account with manager-level access",
      "Google account with billing enabled",
    ],
    steps: [
      {
        label: "Enable API Access",
        content:
          "Go to Google Ads > Tools & Settings > Setup > API Center. Enable the Google Ads API for your account.",
      },
      {
        label: "Create OAuth Credentials",
        content:
          "Visit the Google Cloud Console, create a new project, enable the Google Ads API, and create OAuth 2.0 credentials (Web application type). Add your redirect URI as https://api.adpilot.ai/auth/google/callback.",
      },
      {
        label: "Get Developer Token",
        content:
          "In Google Ads API Center, request a developer token. For testing, a basic token works. For production, you'll need a standard access level. Copy your developer token.",
      },
      {
        label: "Configure in AdPilot",
        content:
          "Go to Integrations in AdPilot, click Connect on Google Ads. Paste your OAuth Client ID, Client Secret, and Developer Token. Enter your Google Ads Customer ID (format: XXX-XXX-XXXX). Click Save & Connect.",
      },
      {
        label: "Verify Connection",
        content:
          "After connecting, you should see your campaigns, ad groups, and performance metrics synced automatically. Data refreshes every 4 hours.",
      },
    ],
    tips: [
      "Developer token approval can take up to 24 hours",
      "Use a dedicated Google account for API access",
      "Start with a test account before connecting production",
    ],
  },
  {
    id: "meta-ads",
    icon: Eye,
    title: "Meta Ads (Facebook) Setup",
    color: "#1877F2",
    prerequisites: [
      "A Facebook Business Manager account",
      "Admin access to the ad account",
    ],
    steps: [
      {
        label: "Create Facebook App",
        content:
          "Go to developers.facebook.com, create a new app with the 'Business' type. Add the Marketing API product to your app.",
      },
      {
        label: "Configure App Settings",
        content:
          "In your app dashboard, go to Settings > Basic. Note your App ID and App Secret. Under 'Use Cases', configure the Marketing API permission.",
      },
      {
        label: "Generate Access Token",
        content:
          "In Marketing API tools, generate a System User access token. Assign the 'ads_management' and 'ads_read' permissions. Set a long-lived token (60-90 days) or implement token refresh.",
      },
      {
        label: "Connect Ad Account",
        content:
          "In AdPilot Integrations, click Connect on Meta Ads. Enter your App ID, App Secret, and Access Token. Provide your Ad Account ID (format: act_XXXXXXXXX). Click Save & Connect.",
      },
      {
        label: "Set Up Webhooks (Optional)",
        content:
          "For real-time updates, configure webhooks in Facebook Developers to push status changes to AdPilot. This enables automatic sync when campaigns update.",
      },
    ],
    tips: [
      "System User tokens are more secure than personal tokens",
      "Set up a token refresh mechanism to avoid expiration",
      "Verify your business manager is verified by Meta",
    ],
  },
  {
    id: "tiktok-ads",
    icon: MessageSquare,
    title: "TikTok Ads Setup",
    color: "#111111",
    prerequisites: [
      "A TikTok Business Center account",
      "Admin access to TikTok Ads Manager",
    ],
    steps: [
      {
        label: "Register as Developer",
        content:
          "Go to developers.tiktok.com and register as a developer. Create a new app with the Ads Marketing API scope.",
      },
      {
        label: "Get App Credentials",
        content:
          "In your TikTok app dashboard, note your App ID and App Secret. Under Permissions, request access to 'Campaign Management', 'Audience Management', and 'Reporting'.",
      },
      {
        label: "Generate Access Token",
        content:
          "Use the OAuth 2.0 flow to generate an access token. TikTok tokens are valid for 2 hours but can be refreshed with a refresh token. Implement automatic refresh in your settings.",
      },
      {
        label: "Configure in AdPilot",
        content:
          "In AdPilot Integrations, click Connect on TikTok Ads. Enter your App ID, App Secret, and Access Token. Add your Advertiser ID (found in TikTok Ads Manager settings). Click Save & Connect.",
      },
      {
        label: "Sync Performance Data",
        content:
          "Once connected, TikTok campaign data will sync every 2 hours. You can also manually trigger a sync from the Integrations page.",
      },
    ],
    tips: [
      "TikTok API has rate limits — 100 requests per minute",
      "Token refresh is required every 2 hours",
      "Some metrics may have a 48-hour delay",
    ],
  },
  {
    id: "taboola",
    icon: MousePointerClick,
    title: "Taboola Setup",
    color: "#FF4B4B",
    prerequisites: [
      "A Taboola Ads account with API access enabled",
      "Account manager-level permissions",
    ],
    steps: [
      {
        label: "Request API Access",
        content:
          "Contact your Taboola account manager or email api-support@taboola.com to request API access. You'll need a Taboola API key.",
      },
      {
        label: "Generate API Key",
        content:
          "Once approved, log into your Taboola account. Go to Settings > API Access. Generate a new API key with read/write permissions for campaigns and reporting.",
      },
      {
        label: "Get Account ID",
        content:
          "Your Taboola Account ID is a numeric identifier found under Account Settings > General. It typically starts with a '2' or '4' and is 6-8 digits long.",
      },
      {
        label: "Configure in AdPilot",
        content:
          "In AdPilot Integrations, click Connect on Taboola. Paste your API Key and Account ID. Choose default campaign settings (currency, timezone) for new campaigns.",
      },
      {
        label: "Verify Data Sync",
        content:
          "After connecting, your campaigns and performance data will sync. Note: Taboola reporting data can have up to 6 hours delay for same-day metrics.",
      },
    ],
    tips: [
      "API access may require a minimum monthly spend",
      "Use a dedicated API key for AdPilot",
      "Keep your key secure — it has full account access",
    ],
  },
  {
    id: "hubspot",
    icon: Users,
    title: "HubSpot CRM Setup",
    color: "#FF7A59",
    prerequisites: [
      "A HubSpot account (free or paid)",
      "Marketing Hub or CRM access",
    ],
    steps: [
      {
        label: "Create Private App",
        content:
          "In HubSpot, go to Settings > Integrations > Private Apps. Create a new private app. Name it 'AdPilot AI Integration'.",
      },
      {
        label: "Assign Scopes",
        content:
          "In your private app, assign the following scopes: crm.objects.contacts.read, crm.objects.companies.read, crm.objects.deals.read, marketing.campaigns.read, and reports.read.",
      },
      {
        label: "Copy Access Token",
        content:
          "After creating the app, copy the access token. This token is shown only once — save it securely. HubSpot private app tokens don't expire unless revoked.",
      },
      {
        label: "Configure in AdPilot",
        content:
          "In AdPilot Integrations, click Connect on HubSpot. Paste your access token. Optionally, map HubSpot deal stages to campaign statuses. Click Save & Connect.",
      },
      {
        label: "Enable Bidirectional Sync (Optional)",
        content:
          "For two-way sync, configure which fields map between AdPilot campaigns and HubSpot deals. This lets you track marketing ROI against CRM revenue.",
      },
    ],
    tips: [
      "Private app tokens never expire — no refresh needed",
      "Start with read-only scopes, add write access later",
      "Use separate tokens for staging and production",
    ],
  },
  {
    id: "mailchimp",
    icon: Mail,
    title: "Mailchimp Setup",
    color: "#FFE01B",
    prerequisites: [
      "A Mailchimp account (paid plan recommended for API)",
      "Audience list with campaign data",
    ],
    steps: [
      {
        label: "Generate API Key",
        content:
          "Log into Mailchimp, go to Account > Extras > API Keys. Create a new API key. The key will be a string like 'abc123def456-us1' where the suffix is your data center server.",
      },
      {
        label: "Note Your Server Prefix",
        content:
          "The part after the hyphen in your API key (e.g., 'us1', 'us8') is your data center server prefix. You'll need this to construct the API endpoint URL.",
      },
      {
        label: "Configure in AdPilot",
        content:
          "In AdPilot Integrations, click Connect on Mailchimp. Enter your API Key and Server Prefix. Select which audience/audiences to pull campaign data from.",
      },
      {
        label: "Map Campaign Data",
        content:
          "Configure how Mailchimp campaigns map to AdPilot fields. Common mappings include: Subject Line → Campaign Name, Recipients → Impressions, Opens → Clicks, Revenue → Conversions.",
      },
      {
        label: "Sync Email Performance",
        content:
          "Once connected, your email campaign performance will appear in the Analytics dashboard. Data includes open rates, click rates, and revenue attribution.",
      },
    ],
    tips: [
      "Mailchimp API keys are tied to a single user account",
      "Free accounts have limited API access",
      "Rotate API keys regularly for security",
    ],
  },
  {
    id: "csv-import",
    icon: FileSpreadsheet,
    title: "CSV Import Guide",
    color: "#22C55E",
    prerequisites: [
      "A CSV file with campaign data",
      "Headers matching the expected format",
    ],
    steps: [
      {
        label: "Prepare Your CSV",
        content:
          "Create a CSV file with these columns: name, platform, type, status, budget, spent, impressions, clicks, conversions, revenue. Include a header row with these exact column names.",
      },
      {
        label: "Format Data Correctly",
        content:
          "Use these formats: name (text), platform (google/meta/tiktok/taboola), type (search/display/social/video), status (active/paused/draft/completed), budget (number, no commas), spent (number), impressions (integer), clicks (integer), conversions (integer), revenue (number).",
      },
      {
        label: "Validate Before Import",
        content:
          "On the Campaigns page, click Import CSV. Select your file. AdPilot will preview the first 5 rows and validate the data. Fix any errors shown in red before confirming.",
      },
      {
        label: "Review Import Results",
        content:
          "After import, you'll see a summary: how many campaigns were created, how many had errors, and what went wrong. Failed rows will be listed with the specific error.",
      },
      {
        label: "Verify Campaigns",
        content:
          "Go to the Campaigns page to verify imported data. Metrics like CTR, CPA, and ROAS are calculated automatically from your imported data.",
      },
    ],
    tips: [
      "Download the sample CSV template from the Campaigns page",
      "Maximum 10,000 rows per import",
      "Duplicate campaign names will be skipped",
      "Use commas only as separators, not in values",
    ],
  },
];

const faqItems = [
  {
    q: "Where do I find my API key?",
    a: "Each platform stores API keys differently. Google Cloud Console, Facebook Developers, TikTok Developers, Taboola Account Settings, HubSpot Private Apps, and Mailchimp Account Settings. Check the specific guide above for detailed instructions.",
  },
  {
    q: "How often does data sync?",
    a: "Data sync frequency varies by platform: Google Ads (4 hours), Meta Ads (1 hour), TikTok (2 hours), Taboola (6 hours), HubSpot (instant), Mailchimp (1 hour). You can manually trigger a sync from the Integrations page.",
  },
  {
    q: "Why is my connection showing an error?",
    a: "Common issues include: expired API tokens, revoked permissions, incorrect account IDs, or platform rate limits. Try disconnecting and reconnecting. If the issue persists, check the platform's developer console for specific error messages.",
  },
  {
    q: "Can I connect multiple accounts?",
    a: "Yes, you can connect multiple accounts for each platform. Each connection is stored separately. Go to Integrations and click 'Add Connection' under the desired platform.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All API keys and tokens are encrypted at rest using AES-256. Data in transit uses TLS 1.3. We never share your API credentials with third parties. You can revoke access at any time from the Integrations page.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = helpSections.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.steps.some((step) => step.content.toLowerCase().includes(search.toLowerCase()))
  );

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6 max-w-4xl"
    >
      <motion.div variants={fadeInUp}>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-[#7C3AED]" />
          <h1 className="text-2xl font-bold text-white">Help & Setup Guides</h1>
        </div>
        <p className="text-sm text-[#9CA3AF]">
          Step-by-step instructions for connecting your ad platforms and tools.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
        <input
          placeholder="Search setup guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-[#1F2937] bg-[#111827] pl-10 pr-4 text-sm text-[#FAFAFA] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {helpSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className={cn(
                "glass rounded-xl p-4 text-left transition-all",
                openSection === section.id
                  ? "ring-2 ring-[#7C3AED]/40 bg-white/[0.04]"
                  : "hover:bg-white/[0.04]"
              )}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg mb-3"
                style={{ background: `${section.color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: section.color }} />
              </div>
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              <p className="text-xs text-[#6B7280] mt-1">
                {section.steps.length} steps
              </p>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((section) => (
          <motion.div
            key={section.id}
            variants={fadeInUp}
            className="glass rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ background: `${section.color}15` }}
                >
                  {(() => {
                    const Icon = section.icon;
                    return <Icon className="h-5 w-5" style={{ color: section.color }} />;
                  })()}
                </div>
                <div className="text-left">
                  <h2 className="text-base font-semibold text-white">{section.title}</h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {section.steps.length} step{section.steps.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {openSection === section.id ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </button>

            {openSection === section.id && (
              <div className="px-5 pb-5 space-y-6">
                {section.prerequisites && (
                  <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-4">
                    <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                      Prerequisites
                    </h4>
                    <ul className="space-y-1.5">
                      {section.prerequisites.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#D1D5DB]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E] mt-0.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0 mt-0.5"
                        style={{ background: section.color }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white mb-1">{step.label}</h4>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {section.tips && (
                  <div className="rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 p-4">
                    <h4 className="text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-2">
                      Pro Tips
                    </h4>
                    <ul className="space-y-1.5">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#D1D5DB]">
                          <AlertCircle className="h-3.5 w-3.5 text-[#A78BFA] mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div variants={fadeInUp} className="glass rounded-xl p-12 text-center">
          <Search className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">No guides found</p>
          <p className="text-sm text-[#9CA3AF]">
            Try a different search term, or browse the guides above.
          </p>
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqItems.map((faq) => (
            <div key={faq.q} className="rounded-xl bg-[#111827] border border-[#1F2937] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                className="w-full flex items-center justify-between p-4 text-sm text-left text-white hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-medium">{faq.q}</span>
                {openFaq === faq.q ? (
                  <ChevronUp className="h-4 w-4 text-[#6B7280] shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#6B7280] shrink-0" />
                )}
              </button>
              {openFaq === faq.q && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Still Need Help?</h2>
        <p className="text-sm text-[#9CA3AF] mb-4">
          If you can&apos;t find what you&apos;re looking for, check our documentation or contact support.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCopy("support@adpilot.ai", "email")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-xs font-medium text-[#A78BFA] hover:bg-[#7C3AED]/20 transition-colors"
          >
            {copiedId === "email" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedId === "email" ? "Copied!" : "Copy support email"}
          </button>
          <a
            href="https://docs.adpilot.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F2937] text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-[#374151] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Documentation
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
