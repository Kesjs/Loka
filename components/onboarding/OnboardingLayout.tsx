"use client";

import { ReactNode } from "react";
import AuthShell from "@/components/auth/AuthShell";
import {
  getOnboardingPanelCopy,
  getOnboardingProgressMeta,
  ONBOARDING_VISUALS,
} from "@/lib/auth-copy";
import { Role, Situation } from "./types";

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  role: Role | null;
  situation: Situation | null;
  onPrev?: () => void;
}

export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  role,
  situation,
  onPrev,
}: OnboardingLayoutProps) {
  const copy = getOnboardingPanelCopy(step, role, situation);
  const { showProgress, current, total, percent } = getOnboardingProgressMeta(
    step,
    totalSteps
  );
  const showBackButton = step > 0;
  const visual = copy.visualKey ? ONBOARDING_VISUALS[copy.visualKey] : undefined;

  return (
    <AuthShell
      leftTitle={copy.leftTitle}
      leftSubtitle={copy.leftSubtitle}
      rightHint={copy.rightHint}
      showBack={showBackButton}
      onBack={onPrev}
      step={step}
      role={role}
      situation={situation}
      media={visual ? { type: "image", src: visual.src, alt: visual.alt } : undefined}
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
    >
      {children}
    </AuthShell>
  );
}
