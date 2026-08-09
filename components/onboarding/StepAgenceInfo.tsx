"use client";

import { AgenceInfo } from "./types";
import { Button } from "@/components/ui/button";

interface StepAgenceInfoProps {
  value: AgenceInfo | undefined;
  onChange: (info: AgenceInfo) => void;
  onNext: () => void;
}

export default function StepAgenceInfo({ value, onChange, onNext }: StepAgenceInfoProps) {
  const info = value || { nom: "", ville: "", taillePortefeuille: "1-10" };
  const isComplete = info.nom && info.ville;

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-left">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Nom de l&apos;agence <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={info.nom}
            onChange={(e) => onChange({ ...info, nom: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Mon Agence SARL"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Ville principale <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={info.ville}
            onChange={(e) => onChange({ ...info, ville: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Cotonou"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Taille du portefeuille (environ)
          </label>
          <select
            value={info.taillePortefeuille}
            onChange={(e) =>
              onChange({
                ...info,
                taillePortefeuille: e.target.value as "1-10" | "10-50" | "50+",
              })
            }
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1-10">1 à 10 biens</option>
            <option value="10-50">10 à 50 biens</option>
            <option value="50+">50+ biens</option>
          </select>
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
