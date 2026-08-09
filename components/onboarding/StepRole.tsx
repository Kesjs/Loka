"use client";

import { House, UsersThree, Buildings, Rocket } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
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
                  <p className="mt-1 text-xs text-neutral-500">{role.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button onClick={onNext} disabled={!value} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
