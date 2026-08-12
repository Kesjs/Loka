"use client";

import Link from "next/link";
import { UsersThree, Door } from "@phosphor-icons/react";
import type { DashboardEquipeMembre } from "@/lib/dashboard";
import { EmptyState } from "./EmptyState";

interface TeamOverviewProps {
  equipe: DashboardEquipeMembre[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  gestionnaire: "Gestionnaire",
  mandataire: "Mandataire",
};

export function TeamOverview({ equipe }: TeamOverviewProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Équipe</h3>

      {equipe.length === 0 ? (
        <EmptyState
          icon={UsersThree}
          title="Aucun membre pour l'instant"
          description="Invitez un membre de votre équipe pour lui assigner des logements."
          actionLabel="Gérer l'équipe"
          actionHref="/equipe"
        />
      ) : (
        <ul className="space-y-2.5">
          {equipe.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  {m.nom
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{m.nom}</p>
                  <p className="text-xs text-neutral-500">{ROLE_LABELS[m.roleInterne] || m.roleInterne}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                <Door size={15} className="text-neutral-400" />
                {m.nbLogementsAssignes}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/equipe"
        className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        Gérer l'équipe →
      </Link>
    </div>
  );
}
