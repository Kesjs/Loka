import { useState } from "react";
import { User, Phone, CurrencyCircleDollar, CalendarBlank } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LogementOccupation } from "./types";
import PhoneInputBenin from "@/components/ui/PhoneInputBenin";

interface StepOccupationProps {
  logements: LogementOccupation[];
  onChange: (logements: LogementOccupation[]) => void;
  onNext: () => void;
}

export default function StepOccupation({ logements, onChange, onNext }: StepOccupationProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  function updateLogement(index: number, patch: Partial<LogementOccupation>) {
    const next = logements.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onChange(next);
  }

  function toggleOccupe(index: number, occupe: boolean) {
    updateLogement(index, { occupe });
    setExpanded(occupe ? index : null);
  }

  return (
    <div className="space-y-5">
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {logements.map((logement, i) => (
          <div
            key={i}
            className="border border-neutral-200 rounded-md overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <input
                type="text"
                value={logement.nom}
                onChange={(e) => updateLogement(i, { nom: e.target.value })}
                className="flex-1 min-w-0 rounded-md border border-transparent bg-transparent px-1 text-sm font-medium text-neutral-800 outline-none transition hover:border-neutral-200 focus:border-primary-400 focus:bg-white"
                aria-label="Nom du logement"
              />
              <div className="flex items-center rounded-md bg-neutral-100 p-0.5 text-xs font-medium shrink-0">
                <button
                  type="button"
                  onClick={() => toggleOccupe(i, false)}
                  className={`px-2.5 py-1 rounded ${
                    !logement.occupe
                      ? "bg-white shadow-sm text-neutral-900"
                      : "text-neutral-500"
                  }`}
                >
                  Vide
                </button>
                <button
                  type="button"
                  onClick={() => toggleOccupe(i, true)}
                  className={`px-2.5 py-1 rounded ${
                    logement.occupe
                      ? "bg-primary-600 text-white"
                      : "text-neutral-500"
                  }`}
                >
                  Déjà loué
                </button>
              </div>
            </div>

            {/* Loyer demandé pour tous les logements, occupés ou vacants,
                pour que le "revenu potentiel" du dashboard soit fiable dès le départ */}
            {!logement.occupe && (
              <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-3">
                <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                  <CurrencyCircleDollar size={13} /> Loyer visé (mensuel)
                </label>
                <input
                  type="text"
                  value={logement.loyer ?? ""}
                  onChange={(e) => updateLogement(i, { loyer: e.target.value })}
                  className="mt-1 w-full h-9 px-2.5 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex : 50 000"
                />
              </div>
            )}

            {logement.occupe && (
              <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                      <User size={13} /> Nom du locataire
                    </label>
                    <input
                      type="text"
                      value={logement.locataireNom ?? ""}
                      onChange={(e) => updateLogement(i, { locataireNom: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex : Jean Ahouansou"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                      <Phone size={13} /> Téléphone
                    </label>
                    <PhoneInputBenin
                      value={logement.locataireTelephone ?? ""}
                      onChange={(normalized) =>
                        updateLogement(i, { locataireTelephone: normalized })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                      <CurrencyCircleDollar size={13} /> Loyer
                    </label>
                    <input
                      type="text"
                      value={logement.loyer ?? ""}
                      onChange={(e) => updateLogement(i, { loyer: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex : 50 000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                      <CalendarBlank size={13} /> Début contrat
                    </label>
                    <input
                      type="date"
                      value={logement.dateDebut ?? ""}
                      onChange={(e) => updateLogement(i, { dateDebut: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                      <CalendarBlank size={13} /> Fin contrat
                    </label>
                    <input
                      type="date"
                      value={logement.dateFin ?? ""}
                      onChange={(e) => updateLogement(i, { dateFin: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button onClick={onNext} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
