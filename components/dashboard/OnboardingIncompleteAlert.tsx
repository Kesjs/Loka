"use client";

import { useState } from "react";
import Link from "next/link";
import { WarningCircle, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingIncompleteAlertProps {
  show: boolean;
  profile: "individuel" | "gestionnaire" | "agence";
}

export function OnboardingIncompleteAlert({
  show,
  profile,
}: OnboardingIncompleteAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

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
