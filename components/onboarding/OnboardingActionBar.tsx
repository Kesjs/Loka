"use client";

import { SignOut, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface OnboardingActionBarProps {
  /** true à l'étape 0 (Rôle) — affiche Déconnexion au lieu de Retour. */
  isFirstStep: boolean;
  onBack: () => void;
  onLogout: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel?: string;
  nextLoading?: boolean;
}

/**
 * Barre Retour/Suivant toujours au même endroit, en bas du formulaire —
 * plus aucune étape ne gère son propre bouton "Continuer" en interne.
 * Étape 0 : le bouton de gauche devient Déconnexion (texte seul, discret),
 * jamais un bouton plein — c'est une action de sortie, pas une navigation.
 */
export default function OnboardingActionBar({
  isFirstStep,
  onBack,
  onLogout,
  onNext,
  nextDisabled,
  nextLabel = "Continuer",
  nextLoading = false,
}: OnboardingActionBarProps) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6">
      {isFirstStep ? (
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 text-sm font-light text-neutral-400 transition-colors hover:text-neutral-600"
        >
          <SignOut size={15} />
          Déconnexion
        </button>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-light text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft size={15} />
          Retour
        </button>
      )}

      <Button
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
        className="min-w-[140px] rounded-lg bg-primary-800 px-6 font-bold hover:bg-primary-900"
      >
        {nextLoading ? "Patientez..." : nextLabel}
        {!nextLoading && <ArrowRight size={16} weight="bold" />}
      </Button>
    </div>
  );
}
