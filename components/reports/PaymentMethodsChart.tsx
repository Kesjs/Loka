"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface PaymentMethod {
  name: string
  value: number
}

interface PaymentMethodsChartProps {
  data: PaymentMethod[]
}

export default function PaymentMethodsChart({
  data,
}: PaymentMethodsChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" name="Nombre de paiements" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
