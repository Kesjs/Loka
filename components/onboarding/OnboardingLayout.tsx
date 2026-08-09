"use client";

import { ReactNode } from "react";
import AuthShell from "@/components/auth/AuthShell";
import {
  getOnboardingPanelCopy,
  getOnboardingProgressMeta,
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
