/**
 * components/dashboard/ExpiringContracts.tsx
 * 
 * Affiche les contrats expirant bientôt
 */

"use client";

import { Clock } from "@phosphor-icons/react";

export interface ExpiringContractsProps {
  contracts: any[];
}

export function ExpiringContracts({ contracts }: ExpiringContractsProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const daysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = date.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Contrats expirant</h2>
      
      {contracts.length > 0 ? (
        <div className="space-y-3">
          {contracts.map((contract, idx) => {
            const days = daysUntil(contract.date_fin);
            const isUrgent = days <= 7;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between py-3 px-3 rounded-lg border ${
                  isUrgent
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200 border-neutral-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${isUrgent ? "text-red-600" : "text-yellow-600"}`} />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Contrat n°{idx + 1}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Expire : {formatDate(contract.date_fin)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    isUrgent
                      ? "bg-red-200 text-red-900"
                      : "bg-yellow-200 text-yellow-900"
                  }`}
                >
                  {days}j
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-500">Aucun contrat expirant dans les 30 jours</p>
        </div>
      )}

      <a
        href="/contrats"
        className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block"
      >
        Voir tous les contrats →
      </a>
    </div>
  );
}
