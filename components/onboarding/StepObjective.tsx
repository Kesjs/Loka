import { House, UsersThree, Buildings, Rocket } from "@phosphor-icons/react";
import { Objectif } from "./types";
import { Button } from "@/components/ui/button";

interface StepObjectiveProps {
  value: Objectif | null;
  onChange: (v: Objectif) => void;
  onNext: () => void;
}

const options: { value: Objectif; label: string; icon: typeof House }[] = [
  { value: "proprietaire", label: "Je gère mes propres biens", icon: House },
  { value: "famille", label: "Je gère les biens de ma famille", icon: UsersThree },
  { value: "agence", label: "Je suis une agence immobilière", icon: Buildings },
  { value: "demarre", label: "Je démarre dans l'immobilier", icon: Rocket },
];

export default function StepObjective({ value, onChange, onNext }: StepObjectiveProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-neutral-900">
        Quel est votre profil ?
      </h2>
      <div className="space-y-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
                isSelected
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <Icon
                size={20}
                weight={isSelected ? "fill" : "regular"}
                className={isSelected ? "text-primary-600" : "text-neutral-400"}
              />
              {opt.label}
            </button>
          );
        })}
      </div>
      <Button onClick={onNext} disabled={!value} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
