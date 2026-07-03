import Stripe from "stripe"
import type { PaymentProvider, PaymentIntent, PaymentResult, ProviderName } from "./types"
import { getProviderConfig } from "./types"

export class StripeProvider implements PaymentProvider {
  name: ProviderName = "stripe"
  private client: Stripe | null = null

  private getClient(): Stripe {
    if (!this.client) {
      const config = getProviderConfig("stripe")
      if (!config.secret) throw new Error("Stripe secret key not configured")
      this.client = new Stripe(config.secret, { apiVersion: "2025-04-30.basil" as any })
    }
    return this.client
  }

  async createPayment(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentIntent> {
    const stripe = this.getClient()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    })
    return {
      id: paymentIntent.id,
      amount,
      currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret ?? undefined,
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const stripe = this.getClient()
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (intent.status === "succeeded") {
        return { success: true, providerTransactionId: intent.id }
      }
      return { success: false, error: `Payment status: ${intent.status}` }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Stripe error" }
    }
  }

  verifyWebhook(payload: string | Buffer, signature: string): Record<string, unknown> | null {
    try {
      const config = getProviderConfig("stripe")
      if (!config.webhookSecret) return JSON.parse(payload.toString()) as Record<string, unknown>
      const stripe = this.getClient()
      const event = stripe.webhooks.constructEvent(
        payload instanceof Buffer ? payload : Buffer.from(payload),
        signature,
        config.webhookSecret
      )
      return event as unknown as Record<string, unknown>
    } catch {
      return null
    }
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      const stripe = this.getClient()
      await stripe.refunds.create({
        payment_intent: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
      })
      return { success: true, providerTransactionId: transactionId }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Refund error" }
    }
  }
}
