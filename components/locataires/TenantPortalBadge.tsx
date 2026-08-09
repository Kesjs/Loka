"use client";

import { CircleNotch, CheckCircle } from "@phosphor-icons/react";

interface TenantPortalBadgeProps {
  isActive?: boolean;
  size?: "sm" | "md";
}

export function TenantPortalBadge({
  isActive = false,
  size = "sm",
}: TenantPortalBadgeProps) {
  if (size === "sm") {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
          isActive
            ? "bg-success-100 text-success-700"
            : "bg-neutral-100 text-neutral-600"
        }`}
        title={isActive ? "Espace activé" : "Espace non activé"}
      >
        {isActive ? (
          <>
            <CheckCircle size={12} weight="fill" />
            Espace activé
          </>
        ) : (
          <>
            <CircleNotch size={12} />
            Non activé
          </>
        )}
      </div>
    );
  }

  // size === "md"
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
        isActive
          ? "bg-success-50 text-success-700"
          : "bg-neutral-50 text-neutral-600"
      }`}
    >
      {isActive ? (
        <>
          <CheckCircle size={16} weight="fill" />
          Espace activé
        </>
      ) : (
        <>
          <CircleNotch size={16} />
          Non activé
        </>
      )}
    </div>
  );
}
