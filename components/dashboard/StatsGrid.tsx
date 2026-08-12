/**
 * components/dashboard/StatsGrid.tsx
 *
 * Grille de statistiques principales du dashboard — style inspiré du modèle
 * "Sales Dashboard" (icône en médaillon coloré + badge de tendance), adapté
 * à la palette claire de Loka. Adaptée par rôle :
 * - Propriétaire : + Loyers en retard, écart revenu réel/potentiel
 * - Gestionnaire / Agence : Immeubles / Logements de portefeuille
 */

"use client";

import { CurrencyCircleDollar, Percent, Buildings, Door, WarningCircle, TrendUp } from "@phosphor-icons/react";
import type { OrganisationType } from "@/lib/dashboard";

export interface StatsGridProps {
  stats: {
    revenuMensuel: number;
    tauxOccupation: number;
    nombreImmeubles: number;
    nombreLogements: number;
    loyersEnRetard?: number;
    revenuPotentiel?: number;
  };
  role?: OrganisationType;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(value);
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
  footnote?: string;
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, footnote }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} weight="bold" style={{ color: iconColor }} />
        </span>
        {trend && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend.positive ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-neutral-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-neutral-500">{label}</p>
      {footnote && <p className="mt-2 text-xs text-neutral-400">{footnote}</p>}
    </div>
  );
}

export function StatsGrid({ stats, role = "individuel" }: StatsGridProps) {
  const ecartRevenu = (stats.revenuPotentiel ?? stats.revenuMensuel) - stats.revenuMensuel;
  const showOwnerCards = role === "individuel";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Revenu mensuel"
        value={formatCurrency(stats.revenuMensuel)}
        icon={CurrencyCircleDollar}
        iconBg="#DCFCE7"
        iconColor="#087F5B"
        footnote="Basé sur les contrats actifs"
      />

      <StatCard
        label="Taux d'occupation"
        value={`${stats.tauxOccupation}%`}
        icon={Percent}
        iconBg="#DCFCE7"
        iconColor="#087F5B"
        trend={
          stats.tauxOccupation >= 70
            ? { value: "Bon niveau", positive: true }
            : { value: "À surveiller", positive: false }
        }
      />

      {showOwnerCards ? (
        <>
          <StatCard
            label="Loyers en retard"
            value={String(stats.loyersEnRetard ?? 0)}
            icon={WarningCircle}
            iconBg={(stats.loyersEnRetard ?? 0) > 0 ? "#FEF2F2" : "#F1F5F9"}
            iconColor={(stats.loyersEnRetard ?? 0) > 0 ? "#EF4444" : "#94A3B8"}
            footnote="Locataires concernés ce mois-ci"
          />

          <StatCard
            label="Revenu potentiel"
            value={formatCurrency(stats.revenuPotentiel ?? stats.revenuMensuel)}
            icon={TrendUp}
            iconBg="#FBF3EF"
            iconColor="#D67A52"
            trend={
              ecartRevenu > 0
                ? { value: `+${formatCurrency(ecartRevenu)}`, positive: false }
                : { value: "Optimal", positive: true }
            }
          />
        </>
      ) : (
        <>
          <StatCard
            label="Immeubles"
            value={String(stats.nombreImmeubles)}
            icon={Buildings}
            iconBg="#FBF3EF"
            iconColor="#D67A52"
            footnote="Dans le portefeuille"
          />

          <StatCard
            label="Logements"
            value={String(stats.nombreLogements)}
            icon={Door}
            iconBg="#F1F5F9"
            iconColor="#64748B"
            footnote="Propriétés gérées"
          />
        </>
      )}
    </div>
  );
}
