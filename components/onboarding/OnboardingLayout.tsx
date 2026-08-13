"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import OnboardingStepper from "./OnboardingStepper";
import { getStepCopy } from "@/lib/auth-copy";
import { Role, StepType, getStepSequence } from "./types";

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  role: Role | null;
  onNavigateToStep?: (index: number) => void;
}

/**
 * Colonne gauche de l'onboarding. La vidéo de droite vient du layout
 * partagé app/(auth-flow)/layout.tsx — ce composant ne gère plus que le
 * stepper, le titre de l'étape et le contenu (les boutons Retour/Suivant
 * vivent dans OnboardingActionBar, rendu par la page).
 */
export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  role,
  onNavigateToStep,
}: OnboardingLayoutProps) {
  const stepSequence = getStepSequence(role);
  const currentStepType: StepType = stepSequence[step] ?? "role";
  const copy = getStepCopy(currentStepType, role);

  // "complete" n'est pas une étape à accomplir (pas de stepper sur l'écran final).
  const isCompleteStep = currentStepType === "complete";

  return (
    <div className="flex min-h-full flex-col px-6 py-10 sm:px-10 sm:py-12 md:px-12 md:py-14 lg:px-16">
      <div className="mx-auto w-full max-w-md">
        {!isCompleteStep && (
          <OnboardingStepper
            current={step + 1}
            total={totalSteps - 1}
            label={copy.progressLabel}
            title={copy.leftTitle}
            onNavigate={onNavigateToStep}
          />
        )}

        <motion.div
          key={currentStepType}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {!isCompleteStep && copy.leftSubtitle && (
            <p className="mb-6 text-sm text-neutral-500">{copy.leftSubtitle}</p>
          )}
          {children}
        </motion.div>
      </div>
    </div>
  );
}
