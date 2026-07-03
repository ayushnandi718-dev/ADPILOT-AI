export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret?: string
  providerData?: Record<string, unknown>
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  providerTransactionId?: string
  paymentIntent?: PaymentIntent
  error?: string
}

export interface PaymentProviderConfig {
  enabled: boolean
  testMode: boolean
  apiKey?: string
  secret?: string
  webhookSecret?: string
}

export interface PaymentProvider {
  name: string
  createPayment(amount: number, currency: string, metadata: Record<string, string>): Promise<PaymentIntent>
  confirmPayment(paymentIntentId: string): Promise<PaymentResult>
  verifyWebhook(payload: string | Buffer, signature: string): Record<string, unknown> | null
  refund(transactionId: string, amount?: number): Promise<PaymentResult>
}

export type ProviderName = "stripe" | "paypal" | "razorpay" | "cashfree" | "lemonsqueezy" | "paddle" | "manual"

export function getProviderConfig(provider: ProviderName): PaymentProviderConfig {
  const envKey = (key: string) => process.env[`${provider.toUpperCase()}_${key}`]

  if (provider === "manual") {
    return { enabled: true, testMode: true }
  }

  const apiKey = envKey("API_KEY") || envKey("CLIENT_ID") || ""
  const secret = envKey("SECRET") || envKey("CLIENT_SECRET") || ""
  const enabled = !!(apiKey && secret)

  return {
    enabled,
    testMode: true,
    apiKey,
    secret,
    webhookSecret: envKey("WEBHOOK_SECRET") || "",
  }
}

export function isPaymentLive(provider: ProviderName): boolean {
  if (provider === "manual") return false
  const config = getProviderConfig(provider)
  return config.enabled && !config.testMode
}
