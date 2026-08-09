"use client";

import { motion } from "framer-motion";
import { ProprietaireGere } from "./types";

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && proprietaire.nom && proprietaire.telephone) {
      e.preventDefault();
      onNext();
    }
  };

  const isComplete = proprietaire.nom && proprietaire.telephone;

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900">Premier propriétaire géré</h2>
        <p className="text-sm text-neutral-500">
          Vous pourrez ajouter d'autres propriétaires depuis le tableau de bord
        </p>
      </div>

      <div className="space-y-4 text-left">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={proprietaire.nom}
            onChange={(e) => onChange({ ...proprietaire, nom: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full h-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Marie Dossou"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={proprietaire.telephone}
            onChange={(e) => onChange({ ...proprietaire, telephone: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full h-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="+229 97 00 00 00"
          />
        </div>

        {/* Commission */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
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
              className="flex-1 h-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="10"
            />
            <span className="text-sm font-medium text-neutral-600">%</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Pourcentage retenu par défaut (modifiable ensuite)
          </p>
        </div>

        <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-200">
          * Champs obligatoires
        </p>
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={onNext}
        disabled={!isComplete}
        whileHover={isComplete ? { scale: 1.02 } : {}}
        whileTap={isComplete ? { scale: 0.98 } : {}}
        className="w-full h-10 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
      >
        Continuer
      </motion.button>
    </div>
  );
}
