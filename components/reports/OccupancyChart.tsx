"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface OccupancyChartProps {
  occupied: number
  vacant: number
}

export default function OccupancyChart({
  occupied,
  vacant,
}: OccupancyChartProps) {
  const data = [
    { name: "Occupées", value: occupied },
    { name: "Vacantes", value: vacant },
  ]

  const COLORS = ["#10b981", "#f3f4f6"]

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
