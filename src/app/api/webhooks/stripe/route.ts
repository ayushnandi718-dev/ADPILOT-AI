import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhook } from "@/lib/payment"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") || ""

  const event = verifyWebhook("stripe", body, signature)
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const type = event.type as string
  const data = event.data as Record<string, unknown>
  const obj = data.object as Record<string, unknown>

  try {
    if (type === "payment_intent.succeeded") {
      const pid = obj.id as string
      const metadata = (obj.metadata as Record<string, string>) || {}
      const amount = ((obj.amount_received as number) || 0) / 100
      const currency = (obj.currency as string)?.toUpperCase() || "USD"
      const planName = metadata.planName || "unknown"

      const tx = await prisma.transaction.findFirst({
        where: { providerTransactionId: pid },
      })

      if (!tx) {
        const newTx = await prisma.transaction.create({
          data: {
            userId: metadata.userId || "",
            planName,
            amount,
            currency,
            provider: "stripe",
            paymentMethod: "card",
            status: "paid",
            providerTransactionId: pid,
            description: `${planName} plan subscription`,
            paidAt: new Date(),
          },
        })

        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        await prisma.subscription.create({
          data: {
            userId: metadata.userId || "",
            planName: planName.toLowerCase(),
            status: "active",
            billingCycle: "monthly",
            autoRenew: true,
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
          },
        })

        await prisma.user.update({
          where: { id: metadata.userId || "" },
          data: { plan: planName.toLowerCase() },
        })

        const count = await prisma.invoice.count()
        await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-${String(count + 1).padStart(6, "0")}`,
            userId: metadata.userId || "",
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

    if (type === "payment_intent.payment_failed") {
      const pid = obj.id as string
      await prisma.transaction.updateMany({
        where: { providerTransactionId: pid },
        data: { status: "failed" },
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Stripe webhook error:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
