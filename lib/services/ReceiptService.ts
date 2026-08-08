/**
 * Receipt Service
 * Generate PDF receipts for payments
 */

import jsPDF from "jspdf"
import "jspdf-autotable"

export interface ReceiptData {
  paiementId: string
  proprietaireName: string
  locataireName: string
  logementName: string
  montant: number
  devise: string
  datePaiement: string
  periodeDebut: string
  periodeFin: string
  mode: string
  reference: string
}

/**
 * Generate PDF receipt
 */
export function generateReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("QUITTANCE DE PAIEMENT", margin, 20)

  // Reference
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Référence: ${data.reference}`, margin, 30)
  doc.text(`Date: ${new Date(data.datePaiement).toLocaleDateString("fr-FR")}`, margin, 35)

  // Proprietaire section
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("BAILLEUR", margin, 50)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(data.proprietaireName, margin, 56)

  // Tenant section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("LOCATAIRE", margin + 100, 50)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(data.locataireName, margin + 100, 56)

  // Details table
  const tableData = [
    ["Description", "Période", "Montant"],
    [
      data.logementName || "Loyer",
      `${new Date(data.periodeDebut).toLocaleDateString("fr-FR")} au ${new Date(data.periodeFin).toLocaleDateString("fr-FR")}`,
      `${data.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${data.devise}`,
    ],
  ]

  const yPosition = 70

  // Use autoTable plugin
  ;(doc as any).autoTable({
    head: [tableData[0]],
    body: [tableData[1]],
    startY: yPosition,
    margin: margin,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: 255,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: 0,
    },
  })

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("TOTAL PAYÉ:", margin, finalY)
  doc.text(
    `${data.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${data.devise}`,
    margin + 80,
    finalY
  )

  // Payment method
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Mode de paiement: ${translateMode(data.mode)}`, margin, finalY + 15)

  // Footer
  doc.setFontSize(9)
  doc.setFont("helvetica", "italic")
  const footerY = pageHeight - 20
  doc.text(
    "Cette quittance est valable comme preuve de paiement",
    margin,
    footerY
  )
  doc.text(
    `Générée le: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
    margin,
    footerY + 5
  )

  return doc
}

/**
 * Generate receipt as Blob
 */
export function generateReceiptBlob(data: ReceiptData): Blob {
  const doc = generateReceipt(data)
  return doc.output("blob")
}

/**
 * Download receipt as file
 */
export function downloadReceipt(data: ReceiptData): void {
  const doc = generateReceipt(data)
  doc.save(`quittance-${data.reference}.pdf`)
}

/**
 * Translate payment mode
 */
function translateMode(mode: string): string {
  const modes: Record<string, string> = {
    cash: "Espèces",
    mobile_money: "Mobile Money",
    virement: "Virement bancaire",
    cheque: "Chèque",
  }
  return modes[mode] || mode
}
