import { Buildings, House, MapPin, Storefront, Mountains, Note, UserCircle, Phone } from "@phosphor-icons/react";
import { Role, TypeBien, TypeLocation } from "./types";
import { Button } from "@/components/ui/button";

interface StepPropertyProps {
  role: Role | null;
  value: {
    nom: string;
    adresse: string | null;
    ville: string | null;
    quartier: string | null;
    repere: string | null;
    type: TypeBien | null;
    typeLocation: TypeLocation | null;
  };
  onChange: (v: {
    nom: string;
    adresse: string | null;
    ville: string | null;
    quartier: string | null;
    repere: string | null;
    type: TypeBien | null;
    typeLocation: TypeLocation | null;
  }) => void;
  /** Nom + téléphone du premier propriétaire géré — utilisé seulement en mode Agence. */
  proprietaireGere: { nom: string; telephone: string };
  onChangeProprietaireGere: (v: { nom: string; telephone: string }) => void;
  onNext: () => void;
}

const types: { value: TypeBien; label: string; icon: typeof House }[] = [
  { value: "immeuble", label: "Immeuble", icon: Buildings },
  { value: "maison",   label: "Maison",   icon: House },
  { value: "villa",    label: "Villa",    icon: House },
  { value: "boutique", label: "Boutique", icon: Storefront },
  { value: "terrain",  label: "Terrain",  icon: Mountains },
];

export default function StepProperty({
  role,
  value,
  onChange,
  proprietaireGere,
  onChangeProprietaireGere,
  onNext,
}: StepPropertyProps) {
  const isAgence = role === "agence";
  const proprietaireValid = !isAgence || proprietaireGere.nom.trim() !== "";
  const isValid = value.nom.trim() !== "" && value.type !== null && proprietaireValid;

  function handleChange(field: string, val: string | TypeLocation | null) {
    onChange({ ...value, [field]: val });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="space-y-5">
      {/* Bloc conditionnel Agence — nom + téléphone du premier propriétaire géré.
          Un seul, pas une liste complète (les autres s'ajoutent normalement dans l'app). */}
      {isAgence && (
        <div className="space-y-3 rounded-lg border border-primary-200 bg-primary-50/50 p-4">
          <p className="text-sm font-medium text-primary-800">Premier propriétaire géré</p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
              <UserCircle size={15} /> Nom du propriétaire *
            </label>
            <input
              type="text"
              value={proprietaireGere.nom}
              onChange={(e) => onChangeProprietaireGere({ ...proprietaireGere, nom: e.target.value })}
              placeholder="Ex : Jean Kouassi"
              className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
              <Phone size={15} /> Téléphone
            </label>
            <input
              type="tel"
              value={proprietaireGere.telephone}
              onChange={(e) => onChangeProprietaireGere({ ...proprietaireGere, telephone: e.target.value })}
              placeholder="+229 01 XX XX XX XX"
              className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <p className="text-xs text-primary-700/70">
            Vous pourrez ajouter d'autres propriétaires directement depuis l'application.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {/* Nom */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Nom *</label>
          <input
            type="text"
            value={value.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex : Résidence Les Cocotiers"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = value.type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChange("type", t.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleChange("type", t.value);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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

        {/* Ville */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            <MapPin size={15} /> Ville
          </label>
          <input
            type="text"
            value={value.ville ?? ""}
            onChange={(e) => handleChange("ville", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex : Cotonou"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Quartier */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Quartier</label>
          <input
            type="text"
            value={value.quartier ?? ""}
            onChange={(e) => handleChange("quartier", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex : Fidjrossè"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Repère */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            <Note size={15} /> Repère
          </label>
          <input
            type="text"
            value={value.repere ?? ""}
            onChange={(e) => handleChange("repere", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex : À côté de la pharmacie du Rond-point"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Adresse complète */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            <MapPin size={15} /> Adresse complète
          </label>
          <input
            type="text"
            value={value.adresse ?? ""}
            onChange={(e) => handleChange("adresse", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex : 123 rue de Morès, Cotonou"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-neutral-500">Optionnel</p>
        </div>

        {/* Type de location (optionnel) */}
        <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700">Type de location</label>
            <span className="text-xs text-neutral-400">Optionnel</span>
          </div>
          <div className="flex gap-2">
            {(["longue_duree", "courte_duree"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (value.typeLocation === opt) {
                    onChange({ ...value, typeLocation: null });
                  } else {
                    handleChange("typeLocation", opt);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (value.typeLocation === opt) {
                      onChange({ ...value, typeLocation: null });
                    } else {
                      handleChange("typeLocation", opt);
                    }
                  }
                }}
                className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  value.typeLocation === opt
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {opt === "longue_duree" ? "Longue durée" : "Courte durée"}
              </button>
            ))}
          </div>
          {value.typeLocation && (
            <p className="text-xs text-neutral-500 mt-1">
              {value.typeLocation === "longue_duree"
                ? "Location classique (annuelle ou long terme)"
                : "Location saisonnière (Airbnb, hôtel…)"}
            </p>
          )}
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
