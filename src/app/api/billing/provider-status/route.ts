import { NextResponse } from "next/server"
import { getProviderConfig } from "@/lib/payment"
import type { ProviderName } from "@/lib/payment/types"

export async function GET() {
  const providers: ProviderName[] = ["stripe", "paypal", "razorpay"]
  const status: Record<string, { live: boolean; testMode: boolean }> = {}

  for (const p of providers) {
    const config = getProviderConfig(p)
    status[p] = {
      live: config.enabled && !config.testMode,
      testMode: true,
    }
  }

  return NextResponse.json({ providers: status })
}
