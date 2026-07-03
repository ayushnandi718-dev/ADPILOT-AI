import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhook } from "@/lib/payment"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("paypal-transmission-id") || ""

  const event = verifyWebhook("paypal", body, signature)
  if (!event) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const eventType = event.event_type as string

  try {
    if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource as Record<string, unknown> || {}
      const orderId = resource.id as string || (event.resource as Record<string, unknown>)?.id as string || ""
      const purchaseUnits = (resource.purchase_units as Array<Record<string, unknown>>) || []
      const amount = purchaseUnits[0]?.amount as Record<string, unknown> || {}
      const customId = (purchaseUnits[0]?.custom_id as string) || ""
      const planName = (purchaseUnits[0]?.description as string)?.replace(" Subscription", "") || "unknown"

      const existing = await prisma.transaction.findFirst({
        where: { providerTransactionId: orderId },
      })

      if (!existing) {
        const newTx = await prisma.transaction.create({
          data: {
            userId: customId,
            planName: planName.toLowerCase(),
            amount: parseFloat((amount.value as string) || "0"),
            currency: (amount.currency_code as string) || "USD",
            provider: "paypal",
            paymentMethod: "paypal",
            status: "paid",
            providerTransactionId: orderId,
            description: `${planName} plan subscription`,
            paidAt: new Date(),
          },
        })

        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        await prisma.subscription.create({
          data: {
            userId: customId,
            planName: planName.toLowerCase(),
            status: "active",
            billingCycle: "monthly",
            autoRenew: true,
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
          },
        })

        await prisma.user.update({
          where: { id: customId },
          data: { plan: planName.toLowerCase() },
        })

        const count = await prisma.invoice.count()
        await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-${String(count + 1).padStart(6, "0")}`,
            userId: customId,
            transactionId: newTx.id,
            type: "invoice",
            status: "paid",
            amount: parseFloat((amount.value as string) || "0"),
            tax: 0,
            total: parseFloat((amount.value as string) || "0"),
            currency: (amount.currency_code as string) || "USD",
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("PayPal webhook error:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
