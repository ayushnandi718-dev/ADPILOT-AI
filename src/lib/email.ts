import nodemailer from "nodemailer";
import { generateInvoicePdf } from "@/lib/invoice/pdf";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(port || "587"),
      secure: port === "465",
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    ignoreTLS: true,
  });
}

const appName = process.env.NEXT_PUBLIC_APP_NAME || "AdPilot AI";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl}/api/auth/verify-email?token=${token}`;
  const transport = getTransport();

  try {
    await transport.sendMail({
      from: `"${appName}" <noreply@${new URL(appUrl).hostname}>`,
      to: email,
      subject: `Verify your email for ${appName}`,
      html: `
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0a0a0b;color:#fafafa;border-radius:12px;border:1px solid rgba(255,255,255,0.1)">
          <div style="text-align:center;margin-bottom:24px">
            <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#7C3AED,#A78BFA);margin-bottom:8px"></div>
            <h1 style="font-size:20px;font-weight:700;margin:0;color:#fafafa">${appName}</h1>
          </div>
          <h2 style="font-size:18px;font-weight:600;margin:0 0 8px;color:#fafafa">Verify your email address</h2>
          <p style="font-size:14px;color:#9CA3AF;line-height:1.6;margin:0 0 24px">
            Thanks for signing up! Click the button below to verify your email address and activate your account.
          </p>
          <a href="${link}" style="display:inline-block;padding:12px 32px;border-radius:8px;background:linear-gradient(135deg,#7C3AED,#A78BFA);color:#fff;font-size:14px;font-weight:600;text-decoration:none">
            Verify Email
          </a>
          <p style="font-size:12px;color:#6B7280;margin-top:24px;line-height:1.5">
            If you didn't create this account, you can safely ignore this email.<br>
            This link expires in 24 hours.
          </p>
        </div>
      `,
    });
  } catch {
    console.log("========================================");
    console.log(`[${appName}] Verification email for ${email}`);
    console.log(`Link: ${link}`);
    console.log("========================================");
  }
}

interface PaymentConfirmationData {
  email: string;
  name: string | null;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  billingAddress?: string | null;
  tax?: number;
  taxId?: string | null;
}

const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", AUD: "A$", CAD: "C$",
  SGD: "S$", AED: "د.إ", BRL: "R$", CHF: "Fr", CNY: "¥", HKD: "HK$",
  KRW: "₩", MXN: "MX$", MYR: "RM", NZD: "NZ$", RUB: "₽", SAR: "﷼",
  SEK: "kr", THB: "฿", TRY: "₺", ZAR: "R",
};

export async function sendPaymentConfirmation(data: PaymentConfirmationData): Promise<boolean> {
  const transport = getTransport();
  const sym = currencySymbols[data.currency] || data.currency;

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateInvoicePdf({
      invoiceNumber: data.invoiceNumber,
      planName: data.planName,
      amount: data.amount,
      tax: data.tax ?? 0,
      total: data.amount + (data.tax ?? 0),
      currency: data.currency,
      status: "paid",
      createdAt: data.invoiceDate,
      billingAddress: data.billingAddress,
      taxId: data.taxId,
      user: { name: data.name, email: data.email },
    });
  } catch {
    // PDF generation failed, send email without attachment
  }

  const attachments = pdfBuffer ? [{ filename: `invoice-${data.invoiceNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" as const }] : [];

  try {
    await transport.sendMail({
      from: `"${appName}" <noreply@${new URL(appUrl).hostname}>`,
      to: data.email,
      subject: `Payment Confirmed — ${data.planName} Plan (${sym}${data.amount.toFixed(2)})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#4f46e5;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">Payment Confirmed ✓</h1>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;background:#0a0a0b">
            <p style="color:#fafafa">Hi ${data.name || data.email.split("@")[0]},</p>
            <p style="color:#d1d5db">Your payment for the <strong style="color:#fafafa">${data.planName}</strong> plan was successful.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;border-bottom:1px solid #374151;color:#9ca3af">Amount</td>
                  <td style="padding:8px;border-bottom:1px solid #374151;text-align:right;font-weight:bold;color:#fafafa">
                    ${sym}${data.amount.toFixed(2)}</td></tr>
              ${data.tax ? `<tr><td style="padding:8px;border-bottom:1px solid #374151;color:#9ca3af">Tax</td>
                  <td style="padding:8px;border-bottom:1px solid #374151;text-align:right;color:#fafafa">
                    ${sym}${data.tax.toFixed(2)}</td></tr>` : ""}
              <tr><td style="padding:8px;color:#9ca3af">Total</td>
                  <td style="padding:8px;text-align:right;font-size:18px;font-weight:bold;color:#fafafa">
                    ${sym}${(data.amount + (data.tax ?? 0)).toFixed(2)}</td></tr>
            </table>
            <p style="color:#9ca3af;font-size:14px">Transaction ID: ${data.transactionId}</p>
            <p style="color:#9ca3af;font-size:14px">Your ${data.planName} plan is now active.</p>
            <a href="${appUrl}/dashboard"
               style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">
              Go to Dashboard
            </a>
          </div>
          <div style="background:#1a1a1b;padding:16px;border-radius:0 0 12px 12px;text-align:center;color:#6b7280;font-size:12px">
            ${appName} · support@${new URL(appUrl).hostname}
          </div>
        </div>
      `.trim(),
      attachments,
    });
    return true;
  } catch {
    console.log("========================================");
    console.log(`[${appName}] Payment confirmation for ${data.email}`);
    console.log(`Plan: ${data.planName}, Amount: ${sym}${data.amount.toFixed(2)}`);
    console.log(`Invoice: ${data.invoiceNumber}`);
    console.log("========================================");
    return false;
  }
}
