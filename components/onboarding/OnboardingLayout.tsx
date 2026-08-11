"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import AuthShell from "@/components/auth/AuthShell";
import {
  getOnboardingPanelCopy,
  getOnboardingProgressMeta,
  ONBOARDING_VISUALS,
} from "@/lib/auth-copy";
import { Role, Situation } from "./types";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

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
      footer={step === 0 ? (
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
      ) : undefined}
    >
      {children}
    </AuthShell>
  );
}
