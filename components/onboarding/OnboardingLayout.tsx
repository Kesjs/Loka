"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SignOut, UsersThree, Buildings, DoorOpen, CheckCircle } from "@phosphor-icons/react";
import AuthShell from "@/components/auth/AuthShell";
import { getStepCopy, getOnboardingProgressMeta, ONBOARDING_VISUALS } from "@/lib/auth-copy";
import { Role, StepType, getStepSequence } from "./types";
import { StepRailItem } from "./StepRail";
import { createClient } from "@/lib/supabase/client";

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  role: Role | null;
  onPrev?: () => void;
  /** Permet la navigation arrière depuis le rail en cliquant une étape déjà complétée. */
  onNavigateToStep?: (index: number) => void;
}

// Icône Phosphor par étape — jamais d'emoji, cohérent avec le reste du projet.
const STEP_ICONS: Record<StepType, StepRailItem["icon"]> = {
  role: UsersThree,
  property: Buildings,
  housing_count: DoorOpen,
  complete: CheckCircle,
};

// Descriptions courtes sous chaque étape du rail (desktop uniquement).
const RAIL_DESCRIPTIONS: Partial<Record<StepType, string>> = {
  role: "Votre façon de gérer vos biens",
  property: "Votre premier bien",
  housing_count: "Nombre de logements",
};

export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  role,
  onPrev,
  onNavigateToStep,
}: OnboardingLayoutProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  const stepSequence = getStepSequence(role);
  const currentStepType: StepType = stepSequence[step] ?? "role";
  const copy = getStepCopy(currentStepType, role);
  const { showProgress, current, total, percent } = getOnboardingProgressMeta(step, totalSteps);
  const showBackButton = step > 0;
  const visual = copy.visualKey ? ONBOARDING_VISUALS[copy.visualKey] : undefined;

  // On exclut "complete" du rail : ce n'est pas une étape à accomplir, c'est l'arrivée.
  const railSteps = stepSequence.filter((s) => s !== "complete");
  const railItems: StepRailItem[] = railSteps.map((s) => ({
    key: s,
    label: getStepCopy(s, role).progressLabel,
    description: RAIL_DESCRIPTIONS[s],
    icon: STEP_ICONS[s],
  }));
  const railCurrentIndex = Math.min(step, railSteps.length);

  return (
    <AuthShell
      leftTitle={copy.leftTitle}
      leftSubtitle={copy.leftSubtitle}
      rightHint={copy.rightHint}
      showBack={showBackButton}
      onBack={onPrev}
      step={step}
      role={role}
      media={visual ? { type: "image", src: visual.src, alt: visual.alt } : undefined}
      stepRail={{
        items: railItems,
        currentIndex: railCurrentIndex,
        onNavigate: onNavigateToStep,
      }}
      progress={
        showProgress
          ? {
              current,
              total,
              label: copy.progressLabel,
              percent,
            }
          : undefined
      }
      footer={
        step === 0 ? (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600"
          >
            <SignOut size={14} />
            Annuler et quitter
          </button>
        ) : showBackButton && onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-600"
          >
            Retour
          </button>
        ) : undefined
      }
    >
      {children}
    </AuthShell>
  );
}
