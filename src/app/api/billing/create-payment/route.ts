import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-auth";
import { createPaymentIntent, getProviderConfig } from "@/lib/payment";
import { sendPaymentConfirmation } from "@/lib/email";
import type { ProviderName } from "@/lib/payment/types";

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planName, amount, currency, country, provider, paymentMethod, status: overrideStatus, returnUrl } = await req.json();

    const providerName: ProviderName = provider || "manual";
    const isLive = getProviderConfig(providerName).enabled;
    const finalStatus = isLive ? "pending" : (overrideStatus || "paid");

    let providerTransactionId: string | undefined;
    let clientSecret: string | undefined;
    let providerData: Record<string, unknown> | undefined;

    // If live provider, create a real payment intent
    if (isLive) {
      const intent = await createPaymentIntent(providerName, amount, currency, {
        userId,
        planName: planName.toLowerCase(),
        email: "",
        country: country || "",
      });
      providerTransactionId = intent.id;
      clientSecret = intent.clientSecret;
      providerData = intent.providerData;

      // Don't create transaction yet — webhook will do it on success
      return NextResponse.json({
        success: true,
        requiresAction: true,
        providerTransactionId,
        clientSecret,
        providerData,
        provider: providerName,
      });
    }

    // Cancel any existing active subscriptions
    await prisma.subscription.updateMany({
      where: { userId, status: "active" },
      data: { status: "cancelled", cancelledAt: new Date() },
    });

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create subscription
    await prisma.subscription.create({
      data: {
        userId,
        planName: planName.toLowerCase(),
        status: "active",
        billingCycle: "monthly",
        autoRenew: true,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    await prisma.user.update({ where: { id: userId }, data: { plan: planName.toLowerCase() } });

    // Create transaction record
    const tx = await prisma.transaction.create({
      data: {
        userId,
        planName: planName.toLowerCase(),
        amount,
        currency: currency || "USD",
        provider: providerName,
        paymentMethod: paymentMethod || "card",
        status: finalStatus,
        providerTransactionId: providerTransactionId || `manual_${Date.now()}`,
        description: `${planName} plan subscription`,
        paidAt: finalStatus === "paid" ? new Date() : null,
      },
    });

    // Create invoice
    const count = await prisma.invoice.count();
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(count + 1).padStart(6, "0")}`,
        userId,
        transactionId: tx.id,
        type: "invoice",
        status: finalStatus,
        amount,
        tax: 0,
        total: amount,
        currency: currency || "USD",
      },
    });

    // Send email confirmation + generate PDF if paid
    if (finalStatus === "paid") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await sendPaymentConfirmation({
          email: user.email,
          name: user.name,
          planName,
          amount,
          currency: currency || "USD",
          transactionId: tx.id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      transaction: tx,
      isDummy: !isLive,
    });
  } catch (err) {
    console.error("Payment creation error:", err);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
