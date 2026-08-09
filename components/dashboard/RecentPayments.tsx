/**
 * components/dashboard/RecentPayments.tsx
 * 
 * Affiche les paiements récents
 */

"use client";

import { CheckCircle } from "@phosphor-icons/react";

export interface RecentPaymentsProps {
  payments: any[];
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Paiements récents</h2>
      
      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Paiement n°{idx + 1}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(payment.date_paiement)}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-neutral-900">
                +{formatCurrency(payment.montant)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-500">Aucun paiement récent</p>
        </div>
      )}

      <a
        href="/paiements"
        className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block"
      >
        Voir tous les paiements →
      </a>
    </div>
  );
}
