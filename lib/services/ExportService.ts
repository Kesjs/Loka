/**
 * ExportService
 * Handles PDF and CSV export of reports
 */

import jsPDF from "jspdf"
import "jspdf-autotable"
import { FinancialSummary, OccupancyReport, MonthlyData } from "./ReportService"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export class ExportService {
  /**
   * Export financial report to PDF
   */
  exportFinancialReportPDF(
    data: FinancialSummary & { monthlyData: MonthlyData[] },
    startDate: Date,
    endDate: Date
  ): ArrayBuffer {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Header
    doc.setFontSize(18)
    doc.text("Rapport Financier", 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Période: ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}`,
      20,
      yPosition
    )
    yPosition += 10

    // Summary metrics
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.text("Résumé Financier", 20, yPosition)
    yPosition += 8

    const summaryData = [
      ["Revenu Total", this.formatCurrency(data.totalRevenue)],
      ["Dépenses", this.formatCurrency(data.totalExpenses)],
      ["Bénéfice Net", this.formatCurrency(data.netProfit)],
      ["Marge", `${data.profitMargin.toFixed(1)}%`],
      ["Revenu Mensuel Moyen", this.formatCurrency(data.averageMonthlyRevenue)],
    ]

    ;(doc as any).autoTable({
      startY: yPosition,
      head: [["Métrique", "Valeur"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    // Monthly data table
    doc.setFontSize(11)
    doc.text("Données Mensuelles", 20, yPosition)
    yPosition += 8

    const monthlyTableData = data.monthlyData.map((m) => [
      m.month,
      this.formatCurrency(m.revenue),
      this.formatCurrency(m.expenses),
      this.formatCurrency(m.profit),
    ])

    ;(doc as any).autoTable({
      startY: yPosition,
      head: [["Mois", "Revenu", "Dépenses", "Profit"]],
      body: monthlyTableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 20, right: 20 },
    })

    return doc.output("arraybuffer") as ArrayBuffer
  }

  /**
   * Export occupancy report to PDF
   */
  exportOccupancyReportPDF(data: OccupancyReport): ArrayBuffer {
    const doc = new jsPDF()
    let yPosition = 20

    // Header
    doc.setFontSize(18)
    doc.text("Rapport d'Occupation", 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 20, yPosition)
    yPosition += 10

    // Summary metrics
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.text("Résumé Occupation", 20, yPosition)
    yPosition += 8

    const summaryData = [
      ["Total Logements", data.totalProperties.toString()],
      ["Occupés", data.occupied.toString()],
      ["Vacants", data.vacant.toString()],
      ["Taux d'Occupation", `${data.occupancyRate.toFixed(1)}%`],
    ]

    ;(doc as any).autoTable({
      startY: yPosition,
      head: [["Métrique", "Valeur"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    // Property breakdown table
    doc.setFontSize(11)
    doc.text("Détail par Immeuble", 20, yPosition)
    yPosition += 8

    const propertyData = data.propertyBreakdown.map((p) => [
      p.immeubleNom,
      p.total.toString(),
      p.occupied.toString(),
      p.vacant.toString(),
      `${((p.occupied / p.total) * 100).toFixed(1)}%`,
    ])

    ;(doc as any).autoTable({
      startY: yPosition,
      head: [["Immeuble", "Total", "Occupés", "Vacants", "Taux"]],
      body: propertyData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 20, right: 20 },
    })

    return doc.output("arraybuffer") as ArrayBuffer
  }

  /**
   * Export financial report to CSV
   */
  exportFinancialReportCSV(
    data: FinancialSummary & { monthlyData: MonthlyData[] },
    startDate: Date,
    endDate: Date
  ): string {
    let csv = "Rapport Financier\n"
    csv += `Période,${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}\n\n`

    csv += "Résumé Financier\n"
    csv += "Métrique,Valeur\n"
    csv += `Revenu Total,${data.totalRevenue}\n`
    csv += `Dépenses,${data.totalExpenses}\n`
    csv += `Bénéfice Net,${data.netProfit}\n`
    csv += `Marge,${data.profitMargin.toFixed(1)}%\n`
    csv += `Revenu Mensuel Moyen,${data.averageMonthlyRevenue}\n\n`

    csv += "Données Mensuelles\n"
    csv += "Mois,Revenu,Dépenses,Profit\n"
    data.monthlyData.forEach((m) => {
      csv += `${m.month},${m.revenue},${m.expenses},${m.profit}\n`
    })

    return csv
  }

  /**
   * Export occupancy report to CSV
   */
  exportOccupancyReportCSV(data: OccupancyReport): string {
    let csv = "Rapport d'Occupation\n"
    csv += `Date,${new Date().toLocaleDateString("fr-FR")}\n\n`

    csv += "Résumé Occupation\n"
    csv += "Métrique,Valeur\n"
    csv += `Total Logements,${data.totalProperties}\n`
    csv += `Occupés,${data.occupied}\n`
    csv += `Vacants,${data.vacant}\n`
    csv += `Taux d'Occupation,${data.occupancyRate.toFixed(1)}%\n\n`

    csv += "Détail par Immeuble\n"
    csv += "Immeuble,Total,Occupés,Vacants,Taux\n"
    data.propertyBreakdown.forEach((p) => {
      const rate = ((p.occupied / p.total) * 100).toFixed(1)
      csv += `${p.immeubleNom},${p.total},${p.occupied},${p.vacant},${rate}%\n`
    })

    return csv
  }

  /**
   * Format number as currency
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }
}
