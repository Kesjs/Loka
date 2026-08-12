"use client";

import { useState } from "react";
import Link from "next/link";
import { WarningCircle, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingIncompleteAlertProps {
  show: boolean;
  profile: "individuel" | "gestionnaire" | "agence";
  /** "logo" affiche un rappel non bloquant pour l'upload du logo (Agence uniquement). */
  variant?: "onboarding" | "logo";
}

export function OnboardingIncompleteAlert({
  show,
  profile,
  variant = "onboarding",
}: OnboardingIncompleteAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  if (variant === "logo") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-4 rounded-lg border border-primary-200 bg-primary-50 p-4"
        >
          <div className="flex items-start gap-3">
            <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-primary-600" />
            <p className="text-sm text-primary-800">
              Ajoutez votre logo pour personnaliser vos quittances.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/parametres"
              className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              Ajouter mon logo
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-md p-1.5 text-primary-700 transition-colors hover:bg-primary-100"
              aria-label="Fermer"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  let message = "";
  if (profile === "individuel") {
    message = "Complétez votre profil pour optimiser votre expérience.";
  } else if (profile === "gestionnaire") {
    message = "Complétez votre profil de gestionnaire pour continuer.";
  } else if (profile === "agence") {
    message = "Complétez votre profil d'agence pour configurer votre équipe.";
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4 p-4 bg-accent-50 border border-accent-200 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <WarningCircle
            size={20}
            weight="fill"
            className="text-accent-600 shrink-0 mt-0.5"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium text-accent-900">
              Onboarding incomplet
            </p>
            <p className="text-sm text-accent-700">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/onboarding"
            className="px-3 py-1.5 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Continuer
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-accent-200 text-accent-700 rounded-md transition-colors"
            aria-label="Fermer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
