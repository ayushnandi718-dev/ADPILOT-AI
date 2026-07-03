import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const defaultPlans = [
  { name: "free", price: 0, currency: "USD", billingCycle: "monthly", maxCampaigns: 5, maxAiQueries: 50, maxCreatives: 10, apiLimit: 100, features: JSON.stringify(["5 campaigns", "50 AI queries/mo", "10 creative gens/mo", "Basic analytics"]) },
  { name: "starter", price: 9, currency: "USD", billingCycle: "monthly", maxCampaigns: 20, maxAiQueries: 200, maxCreatives: 50, apiLimit: 1000, features: JSON.stringify(["20 campaigns", "200 AI queries/mo", "50 creative gens/mo", "Advanced analytics", "Email support"]) },
  { name: "professional", price: 29, currency: "USD", billingCycle: "monthly", maxCampaigns: 100, maxAiQueries: 1000, maxCreatives: 200, apiLimit: 5000, features: JSON.stringify(["Unlimited campaigns", "1000 AI queries/mo", "200 creative gens/mo", "Advanced analytics", "Priority support", "API access"]) },
  { name: "business", price: 79, currency: "USD", billingCycle: "monthly", maxCampaigns: null, maxAiQueries: null, maxCreatives: null, apiLimit: 20000, features: JSON.stringify(["Unlimited everything", "20000 API calls/mo", "Priority support", "Custom integrations", "Team accounts (5)"]) },
  { name: "enterprise", price: 199, currency: "USD", billingCycle: "monthly", maxCampaigns: null, maxAiQueries: null, maxCreatives: null, apiLimit: null, features: JSON.stringify(["Unlimited everything", "Unlimited API calls", "Dedicated support", "Custom development", "SLA guarantee", "Team accounts (unlimited)"]) },
];

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  // Auto-seed default plans
  for (const plan of defaultPlans) {
    const existing = await prisma.billingPlan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.billingPlan.create({ data: plan });
    }
  }

  const [plans, totalUsers, activeSubs, expiredSubs, transactions, paidSum, refundedSum, pendingCount, failedCount] = await Promise.all([
    prisma.billingPlan.findMany({ orderBy: { price: "asc" } }),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.count({ where: { status: "expired" } }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { status: "refunded" }, _sum: { amount: true } }),
    prisma.transaction.count({ where: { status: "pending" } }),
    prisma.transaction.count({ where: { status: "failed" } }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [monthlySum, todaySum] = await Promise.all([
    prisma.transaction.aggregate({ where: { status: "paid", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { status: "paid", createdAt: { gte: todayStart } }, _sum: { amount: true } }),
  ]);

  const grossRevenue = paidSum._sum.amount ?? 0;
  const totalRefunded = refundedSum._sum.amount ?? 0;
  const mrr = monthlySum._sum.amount ?? 0;

  return NextResponse.json({
    plans,
    stats: {
      totalRevenue: grossRevenue,
      netRevenue: grossRevenue - totalRefunded,
      mrr,
      arr: mrr * 12,
      todayRevenue: todaySum._sum.amount ?? 0,
      monthlyRevenue: mrr,
      activeSubscriptions: activeSubs,
      expiredSubscriptions: expiredSubs,
      totalTransactions: transactions,
      pendingPayments: pendingCount,
      failedPayments: failedCount,
      refundedAmount: totalRefunded,
      totalUsers,
      churnRate: totalUsers > 0 ? Math.round(((expiredSubs / (totalUsers + expiredSubs)) * 100) * 100) / 100 : 0,
      arpu: totalUsers > 0 ? Math.round((grossRevenue / totalUsers) * 100) / 100 : 0,
      ltv: totalUsers > 0 ? Math.round((grossRevenue / totalUsers) * 12 * 100) / 100 : 0,
    },
  });
}
