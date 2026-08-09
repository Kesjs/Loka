"use client";

import { motion } from "framer-motion";
import { House, UsersThree, Buildings, Rocket } from "@phosphor-icons/react";
import { Role } from "./types";

interface StepRoleProps {
  value: Role | null;
  onChange: (role: Role) => void;
  onNext: () => void;
}

const roles = [
  {
    id: "proprietaire" as const,
    label: "Propriétaire",
    description: "Je gère mes propres biens",
    icon: House,
  },
  {
    id: "gestionnaire" as const,
    label: "Gestionnaire",
    description: "Je gère les biens d'autres personnes",
    icon: UsersThree,
  },
  {
    id: "agence" as const,
    label: "Agence Immobilière",
    description: "Je gère un portefeuille et une équipe",
    icon: Buildings,
  },
  {
    id: "autre" as const,
    label: "Autre Pro",
    description: "Un autre type de professionnel",
    icon: Rocket,
  },
];

export default function StepRole({ value, onChange, onNext }: StepRoleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900">Quel est votre rôle?</h2>
        <p className="text-sm text-neutral-500">
          Cela nous aide à adapter votre expérience
        </p>
      </div>

      {/* Role Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.id;

          return (
            <motion.button
              key={role.id}
              onClick={() => onChange(role.id)}
              onKeyDown={handleKeyDown}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  size={24}
                  weight={isSelected ? "fill" : "regular"}
                  className={isSelected ? "text-primary-600" : "text-neutral-400"}
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{role.label}</p>
                  <p className="text-xs text-neutral-500 mt-1">{role.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={onNext}
        disabled={!value}
        whileHover={value ? { scale: 1.02 } : {}}
        whileTap={value ? { scale: 0.98 } : {}}
        className="w-full h-10 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
      >
        Continuer
      </motion.button>
    </div>
  );
}
