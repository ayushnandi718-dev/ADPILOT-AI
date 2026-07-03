import type { PaymentProvider, PaymentIntent, PaymentResult, ProviderName } from "./types"
import { getProviderConfig } from "./types"
import { StripeProvider } from "./stripe"
import { PayPalProvider } from "./paypal"
import { RazorpayProvider } from "./razorpay"

const providers = new Map<ProviderName, PaymentProvider>()

function getProvider(name: ProviderName): PaymentProvider {
  let provider = providers.get(name)
  if (!provider) {
    switch (name) {
      case "stripe":
        provider = new StripeProvider()
        break
      case "paypal":
        provider = new PayPalProvider()
        break
      case "razorpay":
        provider = new RazorpayProvider()
        break
      default:
        throw new Error(`Unsupported payment provider: ${name}`)
    }
    providers.set(name, provider)
  }
  return provider
}

export async function createPaymentIntent(
  providerName: ProviderName,
  amount: number,
  currency: string,
  metadata: Record<string, string>
): Promise<PaymentIntent> {
  if (providerName === "manual" || !getProviderConfig(providerName).enabled) {
    return {
      id: `manual_${Date.now()}`,
      amount,
      currency,
      status: "succeeded",
    }
  }
  const provider = getProvider(providerName)
  return provider.createPayment(amount, currency, metadata)
}

export async function confirmPayment(
  providerName: ProviderName,
  paymentIntentId: string
): Promise<PaymentResult> {
  if (providerName === "manual") {
    return { success: true, providerTransactionId: `manual_${Date.now()}` }
  }
  const provider = getProvider(providerName)
  return provider.confirmPayment(paymentIntentId)
}

export async function refundPayment(
  providerName: ProviderName,
  transactionId: string,
  amount?: number
): Promise<PaymentResult> {
  if (providerName === "manual") {
    return { success: true }
  }
  const provider = getProvider(providerName)
  return provider.refund(transactionId, amount)
}

export function verifyWebhook(
  providerName: ProviderName,
  payload: string | Buffer,
  signature: string
): Record<string, unknown> | null {
  if (providerName === "manual") return JSON.parse(payload.toString()) as Record<string, unknown>
  const provider = getProvider(providerName)
  return provider.verifyWebhook(payload, signature)
}

export function getSupportedProviders(): ProviderName[] {
  return ["stripe", "paypal", "razorpay", "manual"]
}

export { getProviderConfig } from "./types"
