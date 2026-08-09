"use client";

import { motion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Role, Situation, RoleInterne } from "./types";

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id, roleInterne)}
            className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
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
          </button>
        ))}
      </div>

      {showRoleInterne && situation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 border-t border-neutral-200 pt-4"
        >
          <label className="block text-sm font-medium text-neutral-700">
            Quel est votre rôle dans l&apos;organisation ?
          </label>
          <div className="relative">
            <select
              value={roleInterne || ""}
              onChange={(e) => onChange(situation, e.target.value as RoleInterne)}
              className="h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner un rôle</option>
              {roleInterneOptions.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <CaretDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </div>
        </motion.div>
      )}

      <Button
        onClick={onNext}
        disabled={!situation || (showRoleInterne && !roleInterne)}
        className="w-full"
      >
        Continuer
      </Button>
    </div>
  );
}
