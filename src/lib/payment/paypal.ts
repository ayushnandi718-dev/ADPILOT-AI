import type { PaymentProvider, PaymentIntent, PaymentResult, ProviderName } from "./types"
import { getProviderConfig } from "./types"

export class PayPalProvider implements PaymentProvider {
  name: ProviderName = "paypal"
  private baseUrl: string
  private accessToken: string | null = null

  constructor() {
    this.baseUrl = "https://api-m.sandbox.paypal.com"
    this.accessToken = null
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken

    const config = getProviderConfig("paypal")
    if (!config.apiKey || !config.secret) throw new Error("PayPal credentials not configured")

    const auth = Buffer.from(`${config.apiKey}:${config.secret}`).toString("base64")
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })

    if (!res.ok) throw new Error("Failed to get PayPal access token")

    const data = (await res.json()) as { access_token: string }
    this.accessToken = data.access_token
    return this.accessToken
  }

  async createPayment(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentIntent> {
    const token = await this.getAccessToken()
    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: currency, value: amount.toFixed(2) },
            custom_id: metadata.userId || metadata.email || "",
            description: metadata.planName || "Subscription",
          },
        ],
      }),
    })

    if (!res.ok) throw new Error("Failed to create PayPal order")

    const data = (await res.json()) as { id: string; status: string }
    return {
      id: data.id,
      amount,
      currency,
      status: data.status,
      providerData: { orderId: data.id },
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const token = await this.getAccessToken()
      const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${paymentIntentId}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) return { success: false, error: "PayPal capture failed" }

      const data = (await res.json()) as { id: string; status: string; purchase_units?: Array<{ payments?: { captures?: Array<{ id: string }> } }> }
      const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id

      return {
        success: data.status === "COMPLETED",
        providerTransactionId: captureId || data.id,
      }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "PayPal error" }
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
      const token = await this.getAccessToken()
      const body: Record<string, unknown> = {}
      if (amount) body.amount = { value: amount.toFixed(2), currency_code: "USD" }

      const res = await fetch(`${this.baseUrl}/v2/payments/captures/${transactionId}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) return { success: false, error: "PayPal refund failed" }

      return { success: true, providerTransactionId: transactionId }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Refund error" }
    }
  }
}
