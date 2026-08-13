"use client";

import { Minus, Plus } from "@phosphor-icons/react";
import { LogementOccupation, TypeBien } from "./types";

interface StepHousingCountProps {
  value: number;
  bienNom: string;
  bienType: TypeBien | null;
  onChange: (n: number) => void;
}

/** Pure — appelée par page.tsx au clic sur "Continuer" (barre d'action commune). */
export function generateLogements(count: number, bienType: TypeBien | null): LogementOccupation[] {
  const label = bienType === "immeuble" ? "Appartement" : "Logement";
  return Array.from({ length: count }).map((_, i) => ({
    nom: count === 1 ? bienType === "immeuble" ? "Appartement 1" : "Logement principal" : `${label} ${i + 1}`,
    occupe: false,
  }));
}

export default function StepHousingCount({
  value,
  bienType,
  onChange,
}: StepHousingCountProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="h-10 w-10 flex items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
          disabled={value <= 1}
          aria-label="Diminuer"
        >
          <Minus size={18} />
        </button>
        <span className="text-3xl font-bold text-neutral-900 w-16 text-center tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(999, value + 1))}
          className="h-10 w-10 flex items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
          aria-label="Augmenter"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
