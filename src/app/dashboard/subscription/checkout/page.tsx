"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowRight, Loader2, AlertTriangle, Globe, Mail, CreditCard } from "lucide-react";
import { countries, convertPrice, formatCurrencyAmount, paymentProviders, type CountryInfo } from "@/lib/currencies";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const plans = [
  { id: "free", name: "Free", price: 0 },
  { id: "starter", name: "Starter", price: 9 },
  { id: "professional", name: "Professional", price: 29 },
  { id: "business", name: "Business", price: 79 },
  { id: "enterprise", name: "Enterprise", price: 199 },
];

function StripePaymentForm({
  clientSecret,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  onSuccess: (pid: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    setLoading(false);
    if (error) {
      onError(error.message || "Payment failed");
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-xl bg-[#09090B] border border-white/5">
        <label className="block text-xs text-[#9CA3AF] mb-2">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                color: "#fff",
                fontSize: "14px",
                fontFamily: "monospace",
                "::placeholder": { color: "#6B7280" },
              },
            },
          }}
          className="p-3 rounded-lg bg-white/5 border border-white/10"
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/5 disabled:text-[#6B7280] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Pay with Stripe
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "free";
  const { user } = useAuth();

  const [step, setStep] = useState<"country" | "payment" | "processing" | "success">("country");
  const [selectedPlan, setSelectedPlan] = useState(plans.find(p => p.id === planParam) || plans[0]);
  const [country, setCountry] = useState<CountryInfo | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [selectedProvider, setSelectedProvider] = useState("stripe");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [providerLive, setProviderLive] = useState(false);
  const [liveProviders, setLiveProviders] = useState<Record<string, boolean>>({});
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  const priceUSD = selectedPlan.price;
  const convertedPrice = convertPrice(priceUSD, currency);
  const formattedPrice = formatCurrencyAmount(convertedPrice, currency);

  useEffect(() => {
    fetch("/api/billing/provider-status")
      .then(r => r.json())
      .then(data => {
        const live: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(data.providers as Record<string, { live: boolean }>)) {
          live[k] = v.live;
        }
        setLiveProviders(live);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setProviderLive(!!liveProviders[selectedProvider]);
  }, [selectedProvider, liveProviders]);

  const handleCountrySelect = (c: CountryInfo) => {
    setCountry(c);
    setCurrency(c.currency);
    setStep("payment");
  };

  const handlePaymentSuccess = useCallback(async (pid?: string) => {
    setStep("processing");
    try {
      const res = await fetch("/api/billing/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlan.name,
          amount: convertedPrice,
          currency,
          country: country?.code,
          provider: selectedProvider,
          paymentMethod,
          status: "paid",
          providerTransactionId: pid,
        }),
      });
      const data = await res.json();
      if (data.transaction) {
        setTransactionId(data.transaction.id);
        setInvoiceNumber(data.transaction.invoiceNumber || "");
      }
    } catch {}
    setProcessing(false);
    setStep("success");
  }, [selectedPlan, convertedPrice, currency, country, selectedProvider, paymentMethod]);

  const handleLivePayment = async () => {
    setProcessing(true);
    setLiveError(null);

    try {
      const res = await fetch("/api/billing/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlan.name,
          amount: convertedPrice,
          currency,
          country: country?.code,
          provider: selectedProvider,
          paymentMethod,
          status: "pending",
        }),
      });
      const data = await res.json();

      if (data.requiresAction && selectedProvider === "stripe") {
        setStripeClientSecret(data.clientSecret);
      } else if (data.requiresAction && selectedProvider === "paypal") {
        window.open(
          `https://www.paypal.com/checkoutnow?token=${data.providerTransactionId}`,
          "paypal",
          "width=600,height=600"
        );
        await handlePaymentSuccess(data.providerTransactionId);
      } else if (data.requiresAction && selectedProvider === "razorpay") {
        const razorpayKey = data.providerData?.keyId as string;
        if (typeof window !== "undefined" && razorpayKey) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => {
            interface RazorpayCheckout {
              open(): void;
            }
            interface RazorpayConstructor {
              new(options: Record<string, unknown>): RazorpayCheckout;
            }
            const Razorpay = (window as { Razorpay?: RazorpayConstructor }).Razorpay;
            if (Razorpay) {
              const rzp = new Razorpay({
                key: razorpayKey,
                order_id: data.providerTransactionId,
                amount: (data.providerData?.amount as number) || convertedPrice * 100,
                currency: data.providerData?.currency as string || currency,
                handler: () => handlePaymentSuccess(data.providerTransactionId),
                modal: { ondismiss: () => setProcessing(false) },
              });
              rzp.open();
            }
          };
          document.body.appendChild(script);
        }
      } else {
        await handlePaymentSuccess(data.providerTransactionId);
      }
    } catch (err: unknown) {
      setLiveError(err instanceof Error ? err.message : "Payment failed");
    }
    setProcessing(false);
  };

  const handleDummyPayment = async () => {
    setProcessing(true);
    setStep("processing");
    await new Promise(r => setTimeout(r, 2000));
    try {
      const res = await fetch("/api/billing/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlan.name,
          amount: convertedPrice,
          currency,
          country: country?.code,
          provider: selectedProvider,
          paymentMethod,
          status: "paid",
        }),
      });
      const data = await res.json();
      if (data.transaction) {
        setTransactionId(data.transaction.id);
      }
    } catch {}
    setProcessing(false);
    setStep("success");
  };

  const doPayment = providerLive ? handleLivePayment : handleDummyPayment;

  // Render Stripe Elements wrapper only when needed
  let stripeKey: string | undefined;
  if (selectedProvider === "stripe" && providerLive) {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY || undefined;
  }

  if (step === "success") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pt-8">
        <div className="glass rounded-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-[#9CA3AF] mb-6">
            Your <span className="text-white font-semibold capitalize">{selectedPlan.name}</span> plan has been activated.
          </p>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Plan</span>
              <span className="text-white font-medium capitalize">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Amount</span>
              <span className="text-white font-medium">{formattedPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Currency</span>
              <span className="text-white font-medium">{currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Payment Method</span>
              <span className="text-white font-medium capitalize">{paymentMethod} ({selectedProvider})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Status</span>
              <span className="text-emerald-400 font-medium">Completed</span>
            </div>
            {transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">Transaction ID</span>
                <span className="text-white font-mono text-xs">{transactionId.slice(0, 16)}...</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-6 mb-6">
            <button
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="flex items-center gap-2 text-sm text-[#A78BFA] hover:text-[#7C3AED] transition-colors mx-auto"
            >
              <Mail className="h-4 w-4" />
              {showEmailPreview ? "Hide" : "View"} Confirmation Email
            </button>
            {showEmailPreview && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 rounded-xl bg-[#09090B] border border-white/5 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded bg-[#7C3AED]/10 flex items-center justify-center">
                    <Mail className="h-3 w-3 text-[#A78BFA]" />
                  </div>
                  <span className="text-xs text-[#9CA3AF]">To: {user?.email || "user@example.com"}</span>
                </div>
                <div className="space-y-2 text-xs text-[#D1D5DB]">
                  <p className="font-medium text-white">Subject: Payment Confirmation — {selectedPlan.name} Plan</p>
                  <p>Hi {user?.name || "there"},</p>
                  <p>Your payment of <span className="text-emerald-400 font-medium">{formattedPrice}</span> for the <span className="text-white font-medium capitalize">{selectedPlan.name}</span> plan was successful.</p>
                  <p>Your subscription is now active.</p>
                  <div className="bg-white/[0.02] p-3 rounded-lg mt-2">
                    <p><span className="text-[#6B7280]">Plan:</span> <span className="text-white capitalize">{selectedPlan.name}</span></p>
                    <p><span className="text-[#6B7280]">Amount:</span> <span className="text-white">{formattedPrice}</span></p>
                    <p><span className="text-[#6B7280]">Date:</span> <span className="text-white">{new Date().toLocaleDateString()}</span></p>
                    {invoiceNumber && <p><span className="text-[#6B7280]">Invoice:</span> <span className="text-white">{invoiceNumber}</span></p>}
                  </div>
                  <p className="text-[#6B7280] text-[10px]">
                    {providerLive
                      ? "A confirmation email with your invoice PDF has been sent to your email address."
                      : "This is a dummy preview. Real email will be sent when payment system goes live with SMTP configured."}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="h-11 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-xl transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pt-8">
      {!providerLive && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Payment System Under Testing</p>
            <p className="text-xs text-[#9CA3AF]">This is a dummy payment preview. No real charges will be made. Set API keys in .env to enable live payments.</p>
          </div>
        </div>
      )}
      {providerLive && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <Check className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-400">Live Payment Active</p>
            <p className="text-xs text-[#9CA3AF]">Real {selectedProvider === "stripe" ? "Stripe" : selectedProvider === "paypal" ? "PayPal" : "Razorpay"} payment will be processed.</p>
          </div>
        </div>
      )}

      {/* Plan Summary */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Complete Your Subscription</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">You are subscribing to the <span className="text-white font-semibold capitalize">{selectedPlan.name}</span> plan</p>
          </div>
          <Link href="/dashboard/subscription" className="text-xs text-[#A78BFA] hover:text-[#7C3AED]">Change Plan</Link>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <span className="text-sm text-[#9CA3AF] capitalize">{selectedPlan.name} Plan <span className="text-[#6B7280]">({selectedPlan.id === "free" ? "Free" : "Monthly"})</span></span>
          <span className="text-lg font-bold text-white">{selectedPlan.id === "free" ? "Free" : `$${selectedPlan.price}/mo`}</span>
        </div>
      </div>

      {/* Step 1: Country Selection */}
      {step === "country" && (
        <motion.div variants={{ hidden: {}, visible: {} }} className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-[#7C3AED]" />
            <h2 className="text-lg font-semibold text-white">Select Your Country</h2>
          </div>
          <p className="text-sm text-[#9CA3AF] mb-4">Your currency will be set automatically based on your location.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
            {countries.map(c => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c)}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-[#7C3AED]/10 border border-white/5 hover:border-[#7C3AED]/30 transition-all text-left"
              >
                <span className="text-lg">{c.flag}</span>
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-[10px] text-[#6B7280]">{c.currency} ({c.currencySymbol})</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Payment */}
      {step === "payment" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-[#7C3AED]" />
              <div>
                <h2 className="text-lg font-semibold text-white">Payment Details</h2>
                <p className="text-xs text-[#9CA3AF]">{country?.flag} {country?.name} — {currency} ({country?.currencySymbol})</p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#9CA3AF] capitalize">{selectedPlan.name} Plan (Monthly)</span>
                <span className="text-sm text-white">{priceUSD > 0 ? `$${priceUSD} USD` : "Free"}</span>
              </div>
              {priceUSD > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#9CA3AF]">Currency Conversion</span>
                    <span className="text-sm text-[#A78BFA]">{currency}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-base font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-[#7C3AED]">{formattedPrice}</span>
                  </div>
                </>
              )}
              {priceUSD === 0 && (
                <div className="border-t border-white/5 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-emerald-400">Free</span>
                </div>
              )}
            </div>

            {/* Payment Provider Selection */}
            {priceUSD > 0 && (
              <>
                <h3 className="text-sm font-medium text-white mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {paymentProviders.filter(p => p.id !== "lemonsqueezy" && p.id !== "paddle").map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProvider(p.id);
                        setStripeClientSecret(null);
                        setLiveError(null);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selectedProvider === p.id
                          ? "border-[#7C3AED] bg-[#7C3AED]/10"
                          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <CreditCard className="h-4 w-4 text-[#7C3AED]" />
                      <div>
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        <p className="text-[10px] text-[#6B7280]">{p.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Stripe Elements (live) */}
                {providerLive && selectedProvider === "stripe" && stripeKey && stripeClientSecret && (
                  <Elements stripe={loadStripe(stripeKey)}>
                    <StripePaymentForm
                      clientSecret={stripeClientSecret}
                      onSuccess={(pid) => handlePaymentSuccess(pid)}
                      onError={(msg) => setLiveError(msg)}
                    />
                  </Elements>
                )}

                {/* Dummy card form (test mode or before Stripe intent created) */}
                {!providerLive && (
                  <div className="p-4 rounded-xl bg-[#09090B] border border-white/5">
                    <h3 className="text-sm font-medium text-white mb-3">Card Details (Dummy)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-[#9CA3AF] mb-1">Card Number</label>
                        <input value="4242 4242 4242 4242" readOnly
                          className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-[#6B7280] font-mono" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs text-[#9CA3AF] mb-1">Expiry</label>
                          <input value="12/28" readOnly className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-[#6B7280] font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs text-[#9CA3AF] mb-1">CVV</label>
                          <input value="123" readOnly className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-[#6B7280] font-mono" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-yellow-500/70 mt-3 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Dummy card — no real payment will be processed
                    </p>
                  </div>
                )}

                {/* Live provider button (non-Stripe) */}
                {providerLive && selectedProvider !== "stripe" && (
                  <button
                    onClick={handleLivePayment}
                    disabled={processing}
                    className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/5 disabled:text-[#6B7280] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Pay with {selectedProvider === "paypal" ? "PayPal" : "Razorpay"}
                  </button>
                )}
              </>
            )}

            {liveError && (
              <p className="text-xs text-red-400 mt-2">{liveError}</p>
            )}
          </div>

          {/* Dummy pay button (test mode) */}
          {!providerLive && (
            <>
              <button
                onClick={doPayment}
                disabled={processing}
                className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/5 disabled:text-[#6B7280] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {priceUSD === 0 ? (
                  <>Activate Free Plan <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Pay {formattedPrice} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
              {!providerLive && (
                <p className="text-center text-[10px] text-[#6B7280]">🔒 Test mode — no real payment will be processed</p>
              )}
            </>
          )}

          {/* Live Stripe needs the intent to be created first — show trigger button */}
          {providerLive && selectedProvider === "stripe" && !stripeClientSecret && (
            <button
              onClick={handleLivePayment}
              disabled={processing}
              className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/5 disabled:text-[#6B7280] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Pay {formattedPrice}
            </button>
          )}
        </motion.div>
      )}

      {/* Step 3: Processing */}
      {step === "processing" && (
        <div className="glass rounded-xl p-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#7C3AED] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Processing Payment...</h2>
          <p className="text-sm text-[#9CA3AF]">Please wait while we process your {formattedPrice} payment</p>
        </div>
      )}
    </motion.div>
  );
}
