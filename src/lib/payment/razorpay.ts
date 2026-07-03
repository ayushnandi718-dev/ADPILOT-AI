import Razorpay from "razorpay"
import type { PaymentProvider, PaymentIntent, PaymentResult, ProviderName } from "./types"
import { getProviderConfig } from "./types"

export class RazorpayProvider implements PaymentProvider {
  name: ProviderName = "razorpay"
  private client: Razorpay | null = null

  private getClient(): Razorpay {
    if (!this.client) {
      const config = getProviderConfig("razorpay")
      if (!config.apiKey || !config.secret) throw new Error("Razorpay credentials not configured")
      this.client = new Razorpay({
        key_id: config.apiKey,
        key_secret: config.secret,
      })
    }
    return this.client
  }

  async createPayment(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentIntent> {
    const razorpay = this.getClient()
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      notes: metadata,
    })

    const config = getProviderConfig("razorpay")

    return {
      id: order.id,
      amount,
      currency,
      status: order.status,
      clientSecret: undefined,
      providerData: {
        orderId: order.id,
        keyId: config.apiKey,
        amount: order.amount,
        currency: order.currency,
      },
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const razorpay = this.getClient()
      const order = await razorpay.orders.fetch(paymentIntentId)
      if (order.status === "paid") {
        const payments = await razorpay.orders.fetchPayments(paymentIntentId)
        const items = (payments as unknown as { items: Array<{ id: string }> }).items || []
        return {
          success: true,
          providerTransactionId: items[0]?.id || paymentIntentId,
        }
      }
      return { success: false, error: `Order status: ${order.status}` }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Razorpay error" }
    }
  }

  verifyWebhook(payload: string | Buffer, signature: string): Record<string, unknown> | null {
    try {
      return JSON.parse(payload.toString()) as Record<string, unknown>
    } catch {
      return null
    }
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      const razorpay = this.getClient()
      const options: { payment_id: string; amount?: number } = { payment_id: transactionId }
      if (amount) options.amount = Math.round(amount * 100)
      await razorpay.payments.refund(transactionId, options)
      return { success: true, providerTransactionId: transactionId }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Refund error" }
    }
  }
}
