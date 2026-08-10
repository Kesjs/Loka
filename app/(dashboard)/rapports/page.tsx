"use client"

import { useState } from "react"
import { CurrencyCircleDollar, House, Download } from "@phosphor-icons/react/dist/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RevenueChart from "@/components/reports/RevenueChart"
import OccupancyChart from "@/components/reports/OccupancyChart"
import PaymentMethodsChart from "@/components/reports/PaymentMethodsChart"
import DateRangePicker from "@/components/reports/DateRangePicker"
import { useQuery } from "@tanstack/react-query"
import { assertOk } from "@/lib/api/fetchJson"

export default function RapportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  })

  // Fetch financial report
  const {
    data: financialReport,
    isLoading: financialLoading,
    error: financialError,
  } = useQuery({
    queryKey: [
      "reports/financial",
      dateRange.startDate.toISOString(),
      dateRange.endDate.toISOString(),
    ],
    queryFn: async () => {
      const res = await fetch(
        `/api/reports/financial?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`
      )
      await assertOk(res, "Impossible de charger le rapport financier")
      return res.json()
    },
  })

  // Fetch occupancy report
  const {
    data: occupancyReport,
    isLoading: occupancyLoading,
    error: occupancyError,
  } = useQuery({
    queryKey: ["reports/occupancy"],
    queryFn: async () => {
      const res = await fetch("/api/reports/occupancy")
      await assertOk(res, "Impossible de charger le rapport d'occupation")
      return res.json()
    },
  })

  const handleExportPDF = () => {
    window.location.href = `/api/reports/export?format=pdf&startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`
  }

  const handleExportCSV = () => {
    window.location.href = `/api/reports/export?format=csv&startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-primary-600">Analyse de gestion</p>
        <h1 className="text-2xl font-semibold text-neutral-900">Rapports</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Un aperçu clair de votre activité immobilière et de vos performances.
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        onDateRangeChange={(start, end) =>
          setDateRange({ startDate: start, endDate: end })
        }
        defaultDays={90}
      />

      {/* Tabs */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <CurrencyCircleDollar size={16} />
            Financier
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <House size={16} />
            Occupation
          </TabsTrigger>
        </TabsList>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {financialLoading ? (
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-neutral-500">Chargement des données...</p>
              </CardContent>
            </Card>
          ) : financialReport ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Revenu Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(financialReport.totalRevenue)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Dépenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(financialReport.totalExpenses)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Bénéfice Net
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(financialReport.netProfit)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Marge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-600">
                      {financialReport.profitMargin.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Card className="border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Revenu & Dépenses (Mensuel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={financialReport.monthlyData} />
                </CardContent>
              </Card>

              <Card className="border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Moyens de Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentMethodsChart
                    data={Object.entries(financialReport.paymentMethods || {}).map(
                      ([method, count]) => ({
                        name: method.toUpperCase(),
                        value: Number(count),
                      })
                    )}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-red-600">
                  {financialError instanceof Error
                    ? financialError.message
                    : "Aucune donnée disponible."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="space-y-6">
          {occupancyLoading ? (
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-neutral-500">Chargement des données...</p>
              </CardContent>
            </Card>
          ) : occupancyReport ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Total Logements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-neutral-900">
                      {occupancyReport.totalProperties}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Occupés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {occupancyReport.occupied}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Vacants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-600">
                      {occupancyReport.vacant}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs font-medium text-neutral-600">
                      Taux
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {occupancyReport.occupancyRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Occupancy Chart */}
              <Card className="border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Distribution Occupation</CardTitle>
                </CardHeader>
                <CardContent>
                  <OccupancyChart
                    occupied={occupancyReport.occupied}
                    vacant={occupancyReport.vacant}
                  />
                </CardContent>
              </Card>

              {/* Property Breakdown */}
              <Card className="border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Détail par Immeuble</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="px-4 py-2 text-left font-medium text-neutral-600">
                            Immeuble
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-neutral-600">
                            Total
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-neutral-600">
                            Occupés
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-neutral-600">
                            Vacants
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-neutral-600">
                            Taux
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {occupancyReport.propertyBreakdown.map(
                          (property: any, idx: number) => (
                            <tr
                              key={idx}
                              className="border-b border-neutral-100 hover:bg-neutral-50"
                            >
                              <td className="px-4 py-2 text-neutral-900">
                                {property.immeubleNom}
                              </td>
                              <td className="px-4 py-2 text-neutral-900">
                                {property.total}
                              </td>
                              <td className="px-4 py-2 text-green-600 font-medium">
                                {property.occupied}
                              </td>
                              <td className="px-4 py-2 text-orange-600 font-medium">
                                {property.vacant}
                              </td>
                              <td className="px-4 py-2 text-blue-600 font-medium">
                                {((property.occupied / property.total) * 100).toFixed(
                                  1
                                )}
                                %
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-red-600">
                  {occupancyError instanceof Error
                    ? occupancyError.message
                    : "Aucune donnée disponible."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleExportPDF}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Exporter PDF
        </Button>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Exporter CSV
        </Button>
      </div>
    </div>
  )
}
