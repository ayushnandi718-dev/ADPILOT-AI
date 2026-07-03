import { jsPDF } from "jspdf"

interface InvoiceData {
  invoiceNumber: string
  planName: string
  amount: number
  tax: number
  total: number
  currency: string
  status: string
  billingAddress?: string | null
  taxId?: string | null
  notes?: string | null
  createdAt: Date | string
  user: {
    name: string | null
    email: string
  }
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Colors
  const primary = [79, 70, 229] as const
  const gray = [107, 114, 128] as const
  const lightGray = [243, 244, 246] as const

  // Header
  doc.setFillColor(...primary)
  doc.rect(0, 0, pageWidth, 40, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text("INVOICE", 20, 28)
  doc.setFontSize(10)
  doc.text(data.invoiceNumber, pageWidth - 20, 28, { align: "right" })

  // Company info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text("AdPilot AI", 20, 60)
  doc.text("support@adpilot.ai", 20, 66)
  doc.text("https://adpilot.ai", 20, 72)

  // Bill To
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Bill To", 20, 90)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(data.user.name || data.user.email, 20, 98)
  doc.text(data.user.email, 20, 104)
  if (data.billingAddress) {
    doc.text(data.billingAddress, 20, 110)
  }

  // Invoice details
  const detailsX = pageWidth - 90
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Invoice Date:", detailsX, 90)
  doc.text("Status:", detailsX, 96)
  doc.text("Tax ID:", detailsX, 102)
  doc.setFont("helvetica", "normal")
  doc.text(new Date(data.createdAt).toLocaleDateString(), detailsX + 40, 90)
  doc.setTextColor(data.status === "paid" ? 22 : 220, data.status === "paid" ? 163 : 38, data.status === "paid" ? 74 : 38)
  doc.text(data.status.toUpperCase(), detailsX + 40, 96)
  doc.setTextColor(0, 0, 0)
  doc.text(data.taxId || "N/A", detailsX + 40, 102)

  // Table header
  const tableY = data.billingAddress ? 128 : 120
  doc.setFillColor(...lightGray)
  doc.rect(20, tableY, pageWidth - 40, 8, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Description", 25, tableY + 6)
  doc.text("Amount", pageWidth - 70, tableY + 6, { align: "right" })
  doc.text("Tax", pageWidth - 45, tableY + 6, { align: "right" })
  doc.text("Total", pageWidth - 20, tableY + 6, { align: "right" })

  // Table row
  const rowY = tableY + 12
  doc.setFont("helvetica", "normal")
  doc.text(`${data.planName} Plan`, 25, rowY + 4)
  doc.text(`${data.currency} ${data.amount.toFixed(2)}`, pageWidth - 70, rowY + 4, { align: "right" })
  doc.text(`${data.currency} ${data.tax.toFixed(2)}`, pageWidth - 45, rowY + 4, { align: "right" })
  doc.text(`${data.currency} ${data.total.toFixed(2)}`, pageWidth - 20, rowY + 4, { align: "right" })

  // Total
  const totalY = rowY + 14
  doc.setFillColor(...primary)
  doc.rect(20, totalY, pageWidth - 40, 10, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Total Due", 25, totalY + 7)
  doc.text(`${data.currency} ${data.total.toFixed(2)}`, pageWidth - 20, totalY + 7, { align: "right" })

  // Notes
  if (data.notes) {
    doc.setTextColor(...gray)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("Notes:", 20, totalY + 20)
    doc.text(data.notes, 20, totalY + 28)
  }

  return Buffer.from(doc.output("arraybuffer"))
}
