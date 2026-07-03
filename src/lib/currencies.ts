export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
}

export const countries: CountryInfo[] = [
  { code: "US", name: "United States", currency: "USD", currencySymbol: "$", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£", flag: "🇬🇧" },
  { code: "EU", name: "European Union", currency: "EUR", currencySymbol: "€", flag: "🇪🇺" },
  { code: "IN", name: "India", currency: "INR", currencySymbol: "₹", flag: "🇮🇳" },
  { code: "CA", name: "Canada", currency: "CAD", currencySymbol: "CA$", flag: "🇨🇦" },
  { code: "AU", name: "Australia", currency: "AUD", currencySymbol: "A$", flag: "🇦🇺" },
  { code: "JP", name: "Japan", currency: "JPY", currencySymbol: "¥", flag: "🇯🇵" },
  { code: "CN", name: "China", currency: "CNY", currencySymbol: "¥", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", currency: "BRL", currencySymbol: "R$", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", currency: "MXN", currencySymbol: "Mex$", flag: "🇲🇽" },
  { code: "DE", name: "Germany", currency: "EUR", currencySymbol: "€", flag: "🇩🇪" },
  { code: "FR", name: "France", currency: "EUR", currencySymbol: "€", flag: "🇫🇷" },
  { code: "IT", name: "Italy", currency: "EUR", currencySymbol: "€", flag: "🇮🇹" },
  { code: "ES", name: "Spain", currency: "EUR", currencySymbol: "€", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", currency: "EUR", currencySymbol: "€", flag: "🇳🇱" },
  { code: "SG", name: "Singapore", currency: "SGD", currencySymbol: "S$", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", currency: "HKD", currencySymbol: "HK$", flag: "🇭🇰" },
  { code: "KR", name: "South Korea", currency: "KRW", currencySymbol: "₩", flag: "🇰🇷" },
  { code: "RU", name: "Russia", currency: "RUB", currencySymbol: "₽", flag: "🇷🇺" },
  { code: "ZA", name: "South Africa", currency: "ZAR", currencySymbol: "R", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", currency: "NGN", currencySymbol: "₦", flag: "🇳🇬" },
  { code: "AE", name: "UAE", currency: "AED", currencySymbol: "د.إ", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", currencySymbol: "﷼", flag: "🇸🇦" },
  { code: "CH", name: "Switzerland", currency: "CHF", currencySymbol: "Fr", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", currency: "SEK", currencySymbol: "kr", flag: "🇸🇪" },
  { code: "NO", name: "Norway", currency: "NOK", currencySymbol: "kr", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", currency: "DKK", currencySymbol: "kr", flag: "🇩🇰" },
  { code: "NZ", name: "New Zealand", currency: "NZD", currencySymbol: "NZ$", flag: "🇳🇿" },
  { code: "TR", name: "Turkey", currency: "TRY", currencySymbol: "₺", flag: "🇹🇷" },
  { code: "AR", name: "Argentina", currency: "ARS", currencySymbol: "AR$", flag: "🇦🇷" },
];

export function getCountryByCode(code: string): CountryInfo | undefined {
  return countries.find(c => c.code === code);
}

export const paymentProviders = [
  { id: "stripe", name: "Stripe", enabled: false, description: "Credit/Debit cards, Apple Pay, Google Pay" },
  { id: "paypal", name: "PayPal", enabled: false, description: "PayPal balance, credit cards" },
  { id: "razorpay", name: "Razorpay", enabled: false, description: "UPI, cards, netbanking, wallets (India)" },
  { id: "lemonsqueezy", name: "Lemon Squeezy", enabled: false, description: "Global payments, tax handling" },
  { id: "paddle", name: "Paddle", enabled: false, description: "Global payments, VAT handling" },
  { id: "cashfree", name: "Cashfree", enabled: false, description: "UPI, cards, netbanking (India)" },
];

export function convertPrice(amountUSD: number, toCurrency: string): number {
  const rates: Record<string, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, CAD: 1.36, AUD: 1.52,
    JPY: 149, CNY: 7.24, BRL: 4.97, MXN: 17.15, SGD: 1.34, HKD: 7.82,
    KRW: 1325, RUB: 89.5, ZAR: 18.6, NGN: 1480, AED: 3.67, SAR: 3.75,
    CHF: 0.88, SEK: 10.45, NOK: 10.6, DKK: 6.87, NZD: 1.63, TRY: 30.2,
    ARS: 810,
  };
  const rate = rates[toCurrency] || 1;
  return Math.round(amountUSD * rate * 100) / 100;
}

export function formatCurrencyAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}
