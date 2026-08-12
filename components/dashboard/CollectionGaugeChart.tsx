"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface CollectionGaugeChartProps {
  /** Nombre de contrats actifs à jour ce mois-ci. */
  aJour: number;
  /** Nombre de contrats actifs en retard ce mois-ci. */
  enRetard: number;
}

export function CollectionGaugeChart({ aJour, enRetard }: CollectionGaugeChartProps) {
  const total = aJour + enRetard;
  const taux = total > 0 ? Math.round((aJour / total) * 100) : 100;

  const data = [
    { value: taux, color: taux >= 80 ? "#087F5B" : taux >= 50 ? "#f59e0b" : "#ef4444" },
    { value: 100 - taux, color: "#e5e7eb" },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-2">
        <p className="text-sm font-medium text-neutral-500">Recouvrement</p>
        <p className="text-lg font-semibold text-neutral-900">Loyers du mois</p>
      </div>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={62}
              outerRadius={82}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute bottom-0 flex flex-col items-center pb-1">
          <span className="text-2xl font-bold text-neutral-900">{taux}%</span>
          <span className="text-xs text-neutral-500">à jour</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-5 text-xs">
        <span className="flex items-center gap-1.5 text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-primary-600" />
          À jour ({aJour})
        </span>
        <span className="flex items-center gap-1.5 text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-neutral-300" />
          En retard ({enRetard})
        </span>
      </div>
    </div>
  );
}
