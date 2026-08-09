"use client";

import { motion } from "framer-motion";
import { Role, Situation, RoleInterne } from "./types";
import { CaretDown } from "@phosphor-icons/react";

interface StepSituationProps {
  role: Role | null;
  situation: Situation | null;
  roleInterne?: RoleInterne;
  onChange: (situation: Situation, roleInterne?: RoleInterne) => void;
  onNext: () => void;
}

type SituationOption = {
  id: Situation;
  label: string;
};

const situationsByRole: Record<Role, SituationOption[]> = {
  proprietaire: [
    { id: "possede_deja", label: "Je possède déjà des biens" },
    { id: "premier_bien", label: "Je viens d'acquérir mon premier bien" },
    { id: "commence_louer", label: "Je souhaite commencer à louer" },
    { id: "gere_deja", label: "Je gère déjà des locations" },
  ],
  gestionnaire: [
    { id: "famille", label: "Je gère les biens de ma famille" },
    { id: "particuliers", label: "Je gère les biens de particuliers" },
    { id: "plusieurs_proprietaires", label: "Je gère plusieurs propriétaires" },
  ],
  agence: [
    { id: "demarre_agence", label: "Je démarre mon activité" },
    { id: "portefeuille_existant", label: "Je gère déjà un portefeuille" },
    { id: "migre_autre_outil", label: "Je migre depuis un autre outil" },
  ],
  autre: [
    { id: "plusieurs_proprietaires", label: "Je gère plusieurs propriétaires" },
  ],
};

const roleInterneOptions: RoleInterne[] = [
  "gestionnaire",
  "administrateur",
  "mandataire",
  "autre",
];

export default function StepSituation({
  role,
  situation,
  roleInterne,
  onChange,
  onNext,
}: StepSituationProps) {
  if (!role) return null;

  const options = situationsByRole[role] || [];
  const showRoleInterne = role === "gestionnaire";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && situation) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900">Votre contexte</h2>
        <p className="text-sm text-neutral-500">Mieux comprendre votre situation</p>
      </div>

      {/* Situation Options */}
      <div className="space-y-2">
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onChange(option.id, roleInterne)}
            onKeyDown={handleKeyDown}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
              situation === option.id
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                situation === option.id ? "text-primary-700" : "text-neutral-700"
              }`}
            >
              {option.label}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Role Interne (Gestionnaire only) */}
      {showRoleInterne && situation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 pt-4 border-t border-neutral-200"
        >
          <label className="text-sm font-medium text-neutral-700 block">
            Quel est votre rôle dans l'organisation?
          </label>
          <div className="relative">
            <select
              value={roleInterne || ""}
              onChange={(e) => onChange(situation, e.target.value as RoleInterne)}
              className="w-full h-10 pl-3 pr-10 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
            >
              <option value="">Sélectionner un rôle</option>
              {roleInterneOptions.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <CaretDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        onClick={onNext}
        disabled={!situation || (showRoleInterne && !roleInterne)}
        whileHover={situation ? { scale: 1.02 } : {}}
        whileTap={situation ? { scale: 0.98 } : {}}
        className="w-full h-10 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
      >
        Continuer
      </motion.button>
    </div>
  );
}
