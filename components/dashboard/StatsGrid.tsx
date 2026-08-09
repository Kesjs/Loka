/**
 * components/dashboard/StatsGrid.tsx
 * 
 * Grille de statistiques principales du dashboard
 */

"use client";

import { CurrencyCircleDollar, Percent, Buildings, Door } from "@phosphor-icons/react";

export interface StatsGridProps {
  stats: {
    revenuMensuel: number;
    tauxOccupation: number;
    nombreImmeubles: number;
    nombreLogements: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Revenu mensuel */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">Revenu mensuel</span>
          <CurrencyCircleDollar className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">
          {formatCurrency(stats.revenuMensuel)}
        </p>
        <p className="text-xs text-neutral-500 mt-2">Estimation basée sur les contrats actifs</p>
      </div>

      {/* Taux d'occupation */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">Taux d'occupation</span>
          <Percent className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{stats.tauxOccupation}%</p>
        <div className="w-full bg-neutral-200 rounded-full h-2 mt-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${stats.tauxOccupation}%` }}
          />
        </div>
      </div>

      {/* Nombre d'immeubles */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">Immeubles</span>
          <Buildings className="w-5 h-5 text-orange-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{stats.nombreImmeubles}</p>
        <p className="text-xs text-neutral-500 mt-2">Dans votre portefeuille</p>
      </div>

      {/* Nombre de logements */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">Logements</span>
          <Door className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{stats.nombreLogements}</p>
        <p className="text-xs text-neutral-500 mt-2">Propriétés gérées</p>
      </div>
    </div>
  );
}
