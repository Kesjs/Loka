"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * État vide illustré et orienté-bénéfice, réutilisé partout où une liste
 * (propriétaires, équipe...) n'a pas encore de contenu — plus engageant
 * qu'un simple CTA générique.
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-200 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
        <Icon size={22} weight="regular" className="text-primary-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="max-w-xs text-sm text-neutral-500">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
