"use client";

import { MoyenPaiement } from "./types";
import { Wallet } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface StepPaiementProps {
  moyenPaiement: MoyenPaiement | null;
  garantie: boolean;
  montantGarantie: string;
  onChangeMoyen: (moyen: MoyenPaiement) => void;
  onChangeGarantie: (garantie: boolean) => void;
  onChangeMontant: (montant: string) => void;
  onNext: () => void;
}

const moyensPaiement = [
  { id: "especes" as const, label: "Espèces" },
  { id: "mobile_money" as const, label: "Mobile Money" },
  { id: "virement" as const, label: "Virement bancaire" },
  { id: "plusieurs" as const, label: "Plusieurs moyens" },
];

export default function StepPaiement({
  moyenPaiement,
  garantie,
  montantGarantie,
  onChangeMoyen,
  onChangeGarantie,
  onChangeMontant,
  onNext,
}: StepPaiementProps) {
  const isComplete = moyenPaiement && (!garantie || montantGarantie);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {moyensPaiement.map((moyen) => (
          <button
            key={moyen.id}
            type="button"
            onClick={() => onChangeMoyen(moyen.id)}
            className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
              moyenPaiement === moyen.id
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <Wallet
              size={20}
              weight={moyenPaiement === moyen.id ? "fill" : "regular"}
              className={moyenPaiement === moyen.id ? "text-primary-600" : "text-neutral-400"}
            />
            <p
              className={`text-sm font-medium ${
                moyenPaiement === moyen.id ? "text-primary-700" : "text-neutral-700"
              }`}
            >
              {moyen.label}
            </p>
          </button>
        ))}
      </div>

      {moyenPaiement && (
        <div className="space-y-3 border-t border-neutral-200 pt-4">
          <label className="block text-sm font-medium text-neutral-700">
            Demandez-vous une garantie à l&apos;entrée ?
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChangeGarantie(false)}
              className={`rounded-lg border-2 p-3 transition-all ${
                !garantie ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white"
              }`}
            >
              <p className={`text-sm font-medium ${!garantie ? "text-primary-700" : "text-neutral-700"}`}>
                Non
              </p>
            </button>
            <button
              type="button"
              onClick={() => onChangeGarantie(true)}
              className={`rounded-lg border-2 p-3 transition-all ${
                garantie ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white"
              }`}
            >
              <p className={`text-sm font-medium ${garantie ? "text-primary-700" : "text-neutral-700"}`}>
                Oui
              </p>
            </button>
          </div>

          {garantie && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Montant par défaut (FCFA)
              </label>
              <input
                type="number"
                min="0"
                value={montantGarantie}
                onChange={(e) => onChangeMontant(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex : 500000"
              />
            </div>
          )}
        </div>
      )}

      <Button onClick={onNext} disabled={!isComplete} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
