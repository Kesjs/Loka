"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProgressDots from "@/components/onboarding/ProgressDots";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepProfile from "@/components/onboarding/StepProfile";
import StepRole from "@/components/onboarding/StepRole";
import StepSituation from "@/components/onboarding/StepSituation";
import StepAgenceInfo from "@/components/onboarding/StepAgenceInfo";
import StepProprietaireGere from "@/components/onboarding/StepProprietaireGere";
import StepProperty from "@/components/onboarding/StepProperty";
import StepHousingCount from "@/components/onboarding/StepHousingCount";
import StepOccupation from "@/components/onboarding/StepOccupation";
import StepPaiement from "@/components/onboarding/StepPaiement";
import StepComplete from "@/components/onboarding/StepComplete";
import { getStepConfig } from "@/components/onboarding/stepConfig";
import {
  OnboardingData,
  initialOnboardingData,
  calculateTotalSteps,
  isProprietaireDebutant,
} from "@/components/onboarding/types";
import { createClient } from "@/lib/supabase/client";
import { saveOnboarding } from "@/lib/onboarding-save";

const DRAFT_KEY = "loka_onboarding_draft";

function loadDraft(): { step: number; data: OnboardingData } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(() => loadDraft()?.step ?? 0);
  const [data, setData] = useState<OnboardingData>(() => loadDraft()?.data ?? initialOnboardingData);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");

  const totalSteps = calculateTotalSteps(data.role, data.situation);
  const stepConfig = getStepConfig(step, data.role, data.situation);

  // Auto-skip steps that don't apply to this path
  useEffect(() => {
    if (data.role === "proprietaire" && step === 4) {
      setStep(5);
    }
  }, [data.role, step]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }));
  }, [step, data]);

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish() {
    setFinishing(true);
    setFinishError("");

    const supabase = createClient();
    const { error } = await saveOnboarding(supabase, data);

    if (error) {
      setFinishError(error);
      setFinishing(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY);
    }

    router.push("/home");
    router.refresh();
  }

  function renderStep() {
    switch (step) {
      case 0:
        return <StepWelcome onNext={next} />;

      case 1:
        return (
          <StepProfile
            value={data.profil}
            onChange={(v) => setData((d) => ({ ...d, profil: v }))}
            onNext={next}
          />
        );

      case 2:
        return (
          <StepRole
            value={data.role}
            onChange={(v) => setData((d) => ({ ...d, role: v, situation: null, roleInterne: undefined }))}
            onNext={next}
          />
        );

      case 3:
        return (
          <StepSituation
            role={data.role}
            situation={data.situation}
            roleInterne={data.roleInterne}
            onChange={(sit, roleInt) =>
              setData((d) => ({ ...d, situation: sit, roleInterne: roleInt }))
            }
            onNext={next}
          />
        );

      // Agence: AgenceInfo (step 4)
      case 4:
        if (data.role === "agence") {
          return (
            <StepAgenceInfo
              value={data.agenceInfo}
              onChange={(v) => setData((d) => ({ ...d, agenceInfo: v }))}
              onNext={next}
            />
          );
        }
        // Gestionnaire: ProprietaireGere (step 4)
        if (data.role === "gestionnaire") {
          return (
            <StepProprietaireGere
              value={data.proprietaireGere}
              onChange={(v) => setData((d) => ({ ...d, proprietaireGere: v }))}
              onNext={next}
            />
          );
        }
        // Propriétaire: auto-skipped
        return null;

      // Agence: ProprietaireGere (step 5)
      case 5:
        if (data.role === "agence") {
          return (
            <StepProprietaireGere
              value={data.proprietaireGere}
              onChange={(v) => setData((d) => ({ ...d, proprietaireGere: v }))}
              onNext={next}
            />
          );
        }
        // Gestionnaire/Propriétaire: Property
        if (data.role === "gestionnaire" || data.role === "proprietaire") {
          return (
            <StepProperty
              value={data.bien}
              onChange={(v) => setData((d) => ({ ...d, bien: v }))}
              onNext={next}
            />
          );
        }
        return null;

      // Agence: Property (step 6)
      case 6:
        if (data.role === "agence") {
          return (
            <StepProperty
              value={data.bien}
              onChange={(v) => setData((d) => ({ ...d, bien: v }))}
              onNext={next}
            />
          );
        }
        // Gestionnaire/Propriétaire: HousingCount
        if (data.role === "gestionnaire" || data.role === "proprietaire") {
          return (
            <StepHousingCount
              value={data.nombreLogements}
              bienNom={data.bien.nom}
              bienType={data.bien.type}
              onChange={(n) => setData((d) => ({ ...d, nombreLogements: n }))}
              onGenerate={(logements) => setData((d) => ({ ...d, logements }))}
              onNext={next}
            />
          );
        }
        return null;

      // Agence: HousingCount (step 7)
      case 7:
        if (data.role === "agence") {
          return (
            <StepHousingCount
              value={data.nombreLogements}
              bienNom={data.bien.nom}
              bienType={data.bien.type}
              onChange={(n) => setData((d) => ({ ...d, nombreLogements: n }))}
              onGenerate={(logements) => setData((d) => ({ ...d, logements }))}
              onNext={next}
            />
          );
        }
        // Propriétaire non-débutant: Occupation
        if (!isProprietaireDebutant(data.role, data.situation)) {
          return (
            <StepOccupation
              logements={data.logements}
              onChange={(logements) => setData((d) => ({ ...d, logements }))}
              onNext={next}
            />
          );
        }
        // Propriétaire débutant: skip to Complete
        return null;

      // Agence/Gestionnaire: Occupation (step 8)
      case 8:
        if (data.role === "agence" || data.role === "gestionnaire") {
          return (
            <StepOccupation
              logements={data.logements}
              onChange={(logements) => setData((d) => ({ ...d, logements }))}
              onNext={next}
            />
          );
        }
        // Propriétaire non-débutant: Paiement
        if (!isProprietaireDebutant(data.role, data.situation)) {
          return (
            <StepPaiement
              moyenPaiement={data.moyenPaiement}
              garantie={data.preferences.garantie}
              montantGarantie={data.preferences.montantGarantie}
              onChangeMoyen={(v) => setData((d) => ({ ...d, moyenPaiement: v }))}
              onChangeGarantie={(v) =>
                setData((d) => ({
                  ...d,
                  preferences: { ...d.preferences, garantie: v },
                }))
              }
              onChangeMontant={(v) =>
                setData((d) => ({
                  ...d,
                  preferences: { ...d.preferences, montantGarantie: v },
                }))
              }
              onNext={next}
            />
          );
        }
        return null;

      // Agence: Paiement (step 9)
      case 9:
        if (data.role === "agence") {
          return (
            <StepPaiement
              moyenPaiement={data.moyenPaiement}
              garantie={data.preferences.garantie}
              montantGarantie={data.preferences.montantGarantie}
              onChangeMoyen={(v) => setData((d) => ({ ...d, moyenPaiement: v }))}
              onChangeGarantie={(v) =>
                setData((d) => ({
                  ...d,
                  preferences: { ...d.preferences, garantie: v },
                }))
              }
              onChangeMontant={(v) =>
                setData((d) => ({
                  ...d,
                  preferences: { ...d.preferences, montantGarantie: v },
                }))
              }
              onNext={next}
            />
          );
        }
        return null;

      // Complete: Last step
      case totalSteps - 1:
        return (
          <StepComplete
            onFinish={handleFinish}
            loading={finishing}
            error={finishError}
          />
        );

      default:
        return null;
    }
  }

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onPrev={prev}
      illustration={stepConfig.illustration}
      title={stepConfig.title}
      subtitle={stepConfig.subtitle}
      iconName={stepConfig.icon as any}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
