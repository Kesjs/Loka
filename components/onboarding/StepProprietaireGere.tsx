"use client";

import { ProprietaireGere } from "./types";
import { Button } from "@/components/ui/button";

interface StepProprietaireGereProps {
  value: ProprietaireGere | undefined;
  onChange: (proprietaire: ProprietaireGere) => void;
  onNext: () => void;
}

export default function StepProprietaireGere({
  value,
  onChange,
  onNext,
}: StepProprietaireGereProps) {
  const proprietaire = value || { nom: "", telephone: "", commissionPct: 10 };
  const isComplete = proprietaire.nom && proprietaire.telephone;

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-left">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Nom complet <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={proprietaire.nom}
            onChange={(e) => onChange({ ...proprietaire, nom: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Marie Dossou"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Téléphone <span className="text-danger-500">*</span>
          </label>
          <input
            type="tel"
            value={proprietaire.telephone}
            onChange={(e) => onChange({ ...proprietaire, telephone: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="+229 97 00 00 00"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Commission habituelle (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={proprietaire.commissionPct || 10}
              onChange={(e) =>
                onChange({
                  ...proprietaire,
                  commissionPct: parseFloat(e.target.value),
                })
              }
              className="h-10 flex-1 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="10"
            />
            <span className="text-sm font-medium text-neutral-600">%</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Pourcentage retenu par défaut (modifiable ensuite)
          </p>
        </div>

        <p className="border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          <span className="text-danger-500">*</span> Champs obligatoires
        </p>
      </div>

      <Button onClick={onNext} disabled={!isComplete} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
