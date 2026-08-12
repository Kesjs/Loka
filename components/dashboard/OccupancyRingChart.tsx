"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface OccupancyRingChartProps {
  occupes: number;
  vacants: number;
}

export function OccupancyRingChart({ occupes, vacants }: OccupancyRingChartProps) {
  const total = occupes + vacants;
  const tauxOccupation = total > 0 ? Math.round((occupes / total) * 100) : 0;

  const data = [
    { name: "Occupés", value: occupes || 0, color: "#087F5B" },
    { name: "Vacants", value: vacants || 0, color: "#e5e7eb" },
  ];

  // Si aucun logement, on affiche un anneau vide plutôt qu'un graphique cassé.
  const displayData = total === 0 ? [{ name: "Aucun logement", value: 1, color: "#e5e7eb" }] : data;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-2">
        <p className="text-sm font-medium text-neutral-500">Occupation</p>
        <p className="text-lg font-semibold text-neutral-900">Répartition des logements</p>
      </div>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={displayData}
              dataKey="value"
              innerRadius={58}
              outerRadius={78}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-neutral-900">{tauxOccupation}%</span>
          <span className="text-xs text-neutral-500">occupé</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-5 text-xs">
        <span className="flex items-center gap-1.5 text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-primary-600" />
          Occupés ({occupes})
        </span>
        <span className="flex items-center gap-1.5 text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-neutral-300" />
          Vacants ({vacants})
        </span>
      </div>
    </div>
  );
}
