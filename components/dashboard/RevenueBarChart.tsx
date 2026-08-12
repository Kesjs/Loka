"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

interface RevenueBarChartProps {
  data: { mois: string; total: number }[];
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="text-sm font-semibold text-neutral-900">
        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(
          payload[0].value
        )}
      </p>
    </div>
  );
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const currentMonthIndex = data.length - 1;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">Revenus encaissés</p>
          <p className="text-lg font-semibold text-neutral-900">6 derniers mois</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="mois"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={formatCompact}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(8,127,91,0.06)" }} />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={28}>
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={index === currentMonthIndex ? "#087F5B" : "#bbf7d0"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
