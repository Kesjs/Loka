"use client";

import Link from "next/link";
import { UsersThree, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import type { DashboardProprietaireGere } from "@/lib/dashboard";
import { EmptyState } from "./EmptyState";

interface OwnersMiniTableProps {
  proprietaires: DashboardProprietaireGere[];
  /** Titre adapté au contexte (Gestionnaire: "Propriétaires gérés", Agence: "Propriétaires du portefeuille"). */
  title: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Aucun reversement";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OwnersMiniTable({ proprietaires, title }: OwnersMiniTableProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">{title}</h3>

      {proprietaires.length === 0 ? (
        <EmptyState
          icon={UsersThree}
          title="Aucun propriétaire pour l'instant"
          description="Ajoutez un propriétaire pour suivre ses reversements ici."
          actionLabel="Ajouter un propriétaire"
          actionHref="/proprietaires/new"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="pb-2.5 pr-3">Propriétaire</th>
                <th className="pb-2.5 pr-3">Montant dû</th>
                <th className="pb-2.5 pr-3">Dernier reversement</th>
                <th className="pb-2.5">Statut</th>
              </tr>
            </thead>
            <tbody>
              {proprietaires.map((p) => (
                <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-neutral-900">{p.nom}</p>
                    <p className="text-xs text-neutral-500">
                      {p.nbBiens} bien{p.nbBiens > 1 ? "s" : ""} · {p.nbLogements} logement
                      {p.nbLogements > 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="py-3 pr-3 font-medium text-neutral-900">
                    {formatCurrency(p.montantDu)}
                  </td>
                  <td className="py-3 pr-3 text-neutral-600">
                    {formatDate(p.dateDernierReversement)}
                  </td>
                  <td className="py-3">
                    {p.statut === "a_jour" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600">
                        <CheckCircle size={13} weight="fill" />
                        À jour
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger-600">
                        <WarningCircle size={13} weight="fill" />
                        En retard
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link
        href="/proprietaires"
        className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        Voir tous les propriétaires →
      </Link>
    </div>
  );
}
