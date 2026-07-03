import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhook } from "@/lib/payment"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature") || ""

  const event = verifyWebhook("razorpay", body, signature)
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const eventType = event.event as string
  const payload = event.payload as Record<string, unknown> || {}
  const payment = payload.payment as Record<string, unknown> || {}
  const order = payload.order as Record<string, unknown> || {}

  try {
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentId = payment.id as string || ""
      const orderId = order.id as string || ""
      const notes = (payment.notes as Record<string, string>) || (order.notes as Record<string, string>) || {}
      const amount = ((payment.amount as number) || 0) / 100
      const currency = (payment.currency as string) || (order.currency as string) || "INR"
      const userId = notes.userId || notes.user_id || ""
      const planName = notes.planName || notes.plan_name || "unknown"

      const existing = await prisma.transaction.findFirst({
        where: {
          OR: [
            { providerTransactionId: paymentId },
            { providerTransactionId: orderId },
          ].filter(Boolean),
        },
      })

      if (!existing) {
        const newTx = await prisma.transaction.create({
          data: {
            userId,
            planName: planName.toLowerCase(),
            amount,
            currency,
            provider: "razorpay",
            paymentMethod: "upi",
            status: "paid",
            providerTransactionId: paymentId || orderId,
            description: `${planName} plan subscription`,
            paidAt: new Date(),
          },
        })

        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

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
        })

        await prisma.user.update({
          where: { id: userId },
          data: { plan: planName.toLowerCase() },
        })

        const count = await prisma.invoice.count()
        await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-${String(count + 1).padStart(6, "0")}`,
            userId,
            transactionId: newTx.id,
            type: "invoice",
            status: "paid",
            amount,
            tax: 0,
            total: amount,
            currency,
          },
        })
      }
    }

    if (eventType === "payment.failed") {
      const paymentId = payment.id as string || ""
      await prisma.transaction.updateMany({
        where: { providerTransactionId: paymentId },
        data: { status: "failed" },
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Razorpay webhook error:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
