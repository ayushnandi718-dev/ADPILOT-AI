import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { getProviderConfig } from "@/lib/payment";
import type { ProviderName } from "@/lib/payment/types";

const providerLabels: Record<string, { label: string }> = {
  stripe: { label: "Stripe" },
  paypal: { label: "PayPal" },
  razorpay: { label: "Razorpay" },
  lemonsqueezy: { label: "Lemon Squeezy" },
  paddle: { label: "Paddle" },
  cashfree: { label: "Cashfree" },
};

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const appSettings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const methods: Record<string, { enabled: boolean; label: string; testMode: boolean; live: boolean }> = {};

  for (const [id, info] of Object.entries(providerLabels)) {
    const config = getProviderConfig(id as ProviderName);
    methods[id] = {
      label: info.label,
      enabled: config.enabled,
      testMode: config.testMode || !config.enabled,
      live: config.enabled && !config.testMode,
    };
  }

  const anyLive = Object.values(methods).some(m => m.live);

  return NextResponse.json({
    paymentMethods: methods,
    underTesting: !anyLive,
    siteSettings: appSettings,
  });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  const { provider, enabled } = body;

  if (!provider) {
    return NextResponse.json({ error: "provider required" }, { status: 400 });
  }

  const appSettings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const existing = appSettings?.socialGithub || "{}";
  let config: Record<string, unknown> = {};
  try { config = JSON.parse(existing); } catch {}

  if (!config.paymentProviders) config.paymentProviders = {};
  (config.paymentProviders as Record<string, unknown>)[provider] = { enabled: enabled ?? false, testMode: true };

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { socialGithub: JSON.stringify(config) },
  });

  return NextResponse.json({ success: true });
}
