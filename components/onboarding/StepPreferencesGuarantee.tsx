import { ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface StepPreferencesGuaranteeProps {
  garantie: boolean;
  montantGarantie: string;
  chargesIncluses: boolean;
  charges: string[];
  onChangeGarantie: (v: boolean) => void;
  onChangeMontant: (v: string) => void;
  onChangeChargesIncluses: (v: boolean) => void;
  onToggleCharge: (charge: string) => void;
  onNext: () => void;
}

const chargesOptions = ["Eau", "Électricité", "Internet", "Gardien", "Entretien"];

export default function StepPreferencesGuarantee({
  garantie,
  montantGarantie,
  chargesIncluses,
  charges,
  onChangeGarantie,
  onChangeMontant,
  onChangeChargesIncluses,
  onToggleCharge,
  onNext,
}: StepPreferencesGuaranteeProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={20} weight="duotone" className="text-primary-500" />
          <h2 className="text-base font-semibold text-neutral-900">
            Le locataire a-t-il versé une avance de garantie ?
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mb-3">
          C&apos;est une somme gardée en cas de dégâts, rendue en fin de contrat.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChangeGarantie(true)}
            className={`flex-1 px-4 py-2.5 rounded-md border text-sm font-medium ${
              garantie
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Oui
          </button>
          <button
            type="button"
            onClick={() => onChangeGarantie(false)}
            className={`flex-1 px-4 py-2.5 rounded-md border text-sm font-medium ${
              !garantie
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Non
          </button>
        </div>
        {garantie && (
          <input
            type="text"
            value={montantGarantie}
            onChange={(e) => onChangeMontant(e.target.value)}
            placeholder="Montant (ex : 100 000 FCFA)"
            className="w-full h-10 mt-2 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-neutral-900 mb-3">
          Le loyer couvre-t-il aussi l&apos;eau, l&apos;électricité, etc. ?
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChangeChargesIncluses(true)}
            className={`flex-1 px-4 py-2.5 rounded-md border text-sm font-medium ${
              chargesIncluses
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Oui
          </button>
          <button
            type="button"
            onClick={() => onChangeChargesIncluses(false)}
            className={`flex-1 px-4 py-2.5 rounded-md border text-sm font-medium ${
              !chargesIncluses
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Non
          </button>
        </div>
        {chargesIncluses && (
          <div className="flex flex-wrap gap-2 mt-3">
            {chargesOptions.map((c) => {
              const isSelected = charges.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onToggleCharge(c)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button onClick={onNext} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
