import { DoorOpen, Minus, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LogementOccupation, TypeBien } from "./types";

interface StepHousingCountProps {
  value: number;
  bienNom: string;
  bienType: TypeBien | null;
  onChange: (n: number) => void;
  onGenerate: (logements: LogementOccupation[]) => void;
  onNext: () => void;
}

function generateLogements(count: number, bienType: TypeBien | null): LogementOccupation[] {
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
  onGenerate,
  onNext,
}: StepHousingCountProps) {
  function handleNext() {
    onGenerate(generateLogements(value, bienType));
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <DoorOpen size={32} weight="duotone" className="mx-auto text-primary-500" />
        <h2 className="text-lg font-semibold text-neutral-900">
          Combien de logements possède ce bien ?
        </h2>
        <p className="text-sm text-neutral-500">
          On les nomme automatiquement — vous pourrez modifier chaque nom et loyer à l'étape suivante.
        </p>
      </div>

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

      <Button onClick={handleNext} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
