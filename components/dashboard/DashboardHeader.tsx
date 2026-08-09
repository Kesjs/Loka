/**
 * components/dashboard/DashboardHeader.tsx
 * 
 * En-tête du dashboard avec greeting personnalisé
 */

"use client";

export interface DashboardHeaderProps {
  userName: string;
  greeting: string;
}

export function DashboardHeader({ userName, greeting }: DashboardHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-neutral-900">
        Bienvenue, {userName}
      </h1>
      <p className="text-neutral-600">
        {greeting}
      </p>
    </div>
  );
}
