import { CalendarCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FrequenceLoyer } from "./types";

interface StepPreferencesPaymentProps {
  frequenceLoyer: FrequenceLoyer | null;
  jourEcheance: string;
  onChangeFrequence: (v: FrequenceLoyer) => void;
  onChangeJour: (v: string) => void;
  onNext: () => void;
}

const options: { value: FrequenceLoyer; label: string }[] = [
  { value: "mensuel", label: "Chaque mois" },
  { value: "trimestriel", label: "Tous les 3 mois" },
  { value: "annuel", label: "Une fois par an" },
];

export default function StepPreferencesPayment({
  frequenceLoyer,
  jourEcheance,
  onChangeFrequence,
  onChangeJour,
  onNext,
}: StepPreferencesPaymentProps) {
  const isValid = frequenceLoyer !== null && jourEcheance.trim() !== "";

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <CalendarCheck size={32} weight="duotone" className="mx-auto text-primary-500" />
        <h2 className="text-lg font-semibold text-neutral-900">
          Le locataire paie tous les combien ?
        </h2>
      </div>

      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChangeFrequence(opt.value)}
            className={`w-full text-left px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
              frequenceLoyer === opt.value
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">
          À quelle date le loyer est-il dû ?
        </label>
        <input
          type="text"
          value={jourEcheance}
          onChange={(e) => onChangeJour(e.target.value)}
          placeholder="Ex : le 5 du mois"
          className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
