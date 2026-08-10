"use client";

import { useEffect } from "react";
import { Warning } from "@phosphor-icons/react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur dans le dashboard:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <Warning size={40} className="mx-auto text-danger-500" />
      <h1 className="mt-4 text-xl font-semibold text-neutral-900">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-sm text-neutral-600">{error.message}</p>
      {error.digest && (
        <p className="mt-1 text-xs text-neutral-400">Référence : {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        Réessayer
      </button>
    </div>
  );
}
