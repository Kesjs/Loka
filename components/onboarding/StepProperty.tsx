import { Buildings, House, MapPin, Storefront, Mountains } from "@phosphor-icons/react";
import { TypeBien } from "./types";
import { Button } from "@/components/ui/button";

interface StepPropertyProps {
  value: { nom: string; adresse: string; type: TypeBien | null };
  onChange: (v: { nom: string; adresse: string; type: TypeBien | null }) => void;
  onNext: () => void;
}

const types: { value: TypeBien; label: string; icon: typeof House }[] = [
  { value: "immeuble", label: "Immeuble", icon: Buildings },
  { value: "maison", label: "Maison", icon: House },
  { value: "villa", label: "Villa", icon: House },
  { value: "boutique", label: "Boutique", icon: Storefront },
  { value: "terrain", label: "Terrain", icon: Mountains },
];

export default function StepProperty({ value, onChange, onNext }: StepPropertyProps) {
  const isValid = value.nom.trim() !== "" && value.type !== null;

  return (
    <div className="space-y-5">
      {!isValid && (
        <p className="text-sm text-neutral-500">
          Donnez un nom à votre bien et sélectionnez son type pour continuer.
        </p>
      )}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Ajoutez votre premier bien
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Vous pourrez tout modifier plus tard.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Nom</label>
          <input
            type="text"
            value={value.nom}
            onChange={(e) => onChange({ ...value, nom: e.target.value })}
            placeholder="Ex : Résidence Les Cocotiers"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            <MapPin size={15} /> Adresse
          </label>
          <input
            type="text"
            value={value.adresse}
            onChange={(e) => onChange({ ...value, adresse: e.target.value })}
            placeholder="Ex : Cotonou, Fidjrossè"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = value.type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onChange({ ...value, type: t.value })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <Icon
                    size={16}
                    weight={isSelected ? "fill" : "regular"}
                    className={isSelected ? "text-primary-600" : "text-neutral-400"}
                  />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
