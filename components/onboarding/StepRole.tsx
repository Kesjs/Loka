"use client";

import { House, UsersThree, Buildings, Airplane, CheckCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "./types";

interface StepRoleProps {
  value: Role | null;
  onChange: (role: Role) => void;
  estADistance: boolean;
  onChangeADistance: (v: boolean) => void;
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
    description: "Je gère des biens pour le compte d'autrui",
    icon: UsersThree,
  },
  {
    id: "agence" as const,
    label: "Agence",
    description: "Je gère un portefeuille avec une équipe",
    icon: Buildings,
  },
];

// La case "à distance" n'a de sens que pour Propriétaire et Gestionnaire —
// une Agence est par nature une structure locale organisée.
const DISTANCE_ELIGIBLE_ROLES: Role[] = ["proprietaire", "gestionnaire"];

export default function StepRole({
  value,
  onChange,
  estADistance,
  onChangeADistance,
}: StepRoleProps) {
  const showDistanceOption = value !== null && DISTANCE_ELIGIBLE_ROLES.includes(value);

  function handleSelectRole(role: Role) {
    onChange(role);
    // Si on bascule vers Agence, la case "à distance" n'a plus de sens : on la réinitialise.
    if (!DISTANCE_ELIGIBLE_ROLES.includes(role) && estADistance) {
      onChangeADistance(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => handleSelectRole(role.id)}
              aria-pressed={isSelected}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm"
                  >
                    <CheckCircle size={13} weight="fill" />
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="flex items-start gap-3">
                <Icon
                  size={24}
                  weight={isSelected ? "fill" : "regular"}
                  className={isSelected ? "text-primary-600" : "text-neutral-400"}
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{role.label}</p>
                  <p className="mt-1 text-xs leading-snug text-neutral-500 line-clamp-2">
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Case "à distance" — apparaît seulement si pertinente, jamais de saut de layout brutal */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          showDistanceOption ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <label
          htmlFor="a-distance"
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
            estADistance
              ? "border-primary-300 bg-primary-50"
              : "border-neutral-200 bg-white hover:border-neutral-300"
          }`}
        >
          <input
            id="a-distance"
            type="checkbox"
            checked={estADistance}
            onChange={(e) => onChangeADistance(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="flex items-start gap-2">
            <Airplane
              size={18}
              weight={estADistance ? "fill" : "regular"}
              className={`mt-0.5 shrink-0 ${estADistance ? "text-primary-600" : "text-neutral-400"}`}
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900">
                Je gère mes biens à distance
              </span>
              <span className="block text-xs text-neutral-500">
                Rapports mis en avant, notifications prioritaires par SMS et email
              </span>
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
