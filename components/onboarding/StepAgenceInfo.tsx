"use client";

import { motion } from "framer-motion";
import { AgenceInfo } from "./types";

interface StepAgenceInfoProps {
  value: AgenceInfo | undefined;
  onChange: (info: AgenceInfo) => void;
  onNext: () => void;
}

export default function StepAgenceInfo({ value, onChange, onNext }: StepAgenceInfoProps) {
  const info = value || { nom: "", ville: "", taillePortefeuille: "1-10" };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && info.nom && info.ville) {
      e.preventDefault();
      onNext();
    }
  };

  const isComplete = info.nom && info.ville;

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900">Informations agence</h2>
        <p className="text-sm text-neutral-500">Quelques détails sur votre agence</p>
      </div>

      <div className="space-y-4 text-left">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Nom de l'agence <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={info.nom}
            onChange={(e) => onChange({ ...info, nom: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full h-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Mon Agence SARL"
          />
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Ville principale <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={info.ville}
            onChange={(e) => onChange({ ...info, ville: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full h-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Cotonou"
          />
        </div>

        {/* Taille Portefeuille */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
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
            className="w-full h-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1-10">1 à 10 biens</option>
            <option value="10-50">10 à 50 biens</option>
            <option value="50+">50+ biens</option>
          </select>
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
