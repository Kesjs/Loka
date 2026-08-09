"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
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
  Role,
  Situation,
} from "@/components/onboarding/types";
import { createClient } from "@/lib/supabase/client";
import { saveOnboarding } from "@/lib/onboarding-save";

const DRAFT_KEY = "loka_onboarding_draft";

const variants: Variants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

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

/**
 * Retourne l'étape physique réelle d'après l'étape logique
 */
function getPhysicalStep(logicalStep: number, role: Role | null, situation: Situation | null): number {
  // Étapes toujours présentes
  if (logicalStep === 0) return 0; // Welcome
  if (logicalStep === 1) return 1; // Profile
  if (logicalStep === 2) return 2; // Role
  if (logicalStep === 3) return 3; // Situation

  let physical = 4;

  // Agence uniquement : AgenceInfo
  if (role === "agence") {
    if (logicalStep === 4) return physical; // AgenceInfo
    physical++;
  }

  // Gestionnaire ou Agence : ProprietaireGere
  if (role === "gestionnaire" || role === "agence") {
    const step = role === "agence" ? 5 : 4;
    if (logicalStep === step) return physical; // ProprietaireGere
    physical++;
  }

  // Property
  if (logicalStep === (role === "agence" ? 6 : role === "gestionnaire" ? 5 : 4)) {
    return physical;
  }
  physical++;

  // HousingCount
  const housingCountLogical = role === "agence" ? 7 : role === "gestionnaire" ? 6 : 5;
  if (logicalStep === housingCountLogical) return physical;
  physical++;

  // Propriétaire débutant saute Occupation
  const isDebutant = isProprietaireDebutant(role, situation);

  if (!isDebutant) {
    const occupationLogical = role === "agence" ? 8 : role === "gestionnaire" ? 7 : 6;
    if (logicalStep === occupationLogical) return physical;
    physical++;
  }

  // Propriétaire débutant saute Paiement
  if (!isDebutant) {
    const paiementLogical = role === "agence" ? 9 : role === "gestionnaire" ? 8 : 7;
    if (logicalStep === paiementLogical) return physical;
    physical++;
  }

  // Complete
  return physical;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(() => loadDraft()?.step ?? 0);
  const [data, setData] = useState<OnboardingData>(() => loadDraft()?.data ?? initialOnboardingData);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");

  const totalSteps = calculateTotalSteps(data.role, data.situation);
  const stepConfig = getStepConfig(step, data.role, data.situation);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }));
  }, [step, data]);

  // Auto-skip steps that should be skipped
  useEffect(() => {
    // Propriétaire at step 4: skip to step 5 (Property)
    if (data.role === "proprietaire" && step === 4) {
      setStep(5);
    }
    // Gestionnaire at step 5: skip to step 6 if role not filled (but shouldn't happen)
  }, [data.role, step]);

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

      // Propriétaire : auto-advance via useEffect above
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
        // Gestionnaire : StepProprietaireGere (step 4)
        if (data.role === "gestionnaire") {
          return (
            <StepProprietaireGere
              value={data.proprietaireGere}
              onChange={(v) => setData((d) => ({ ...d, proprietaireGere: v }))}
              onNext={next}
            />
          );
        }
        // Propriétaire : this step is auto-skipped by useEffect
        return null;

      // Agence : StepProprietaireGere (step 5)
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
        // Gestionnaire ou Propriétaire : StepProperty
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

      // Agence : StepProperty (step 6)
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
        // Gestionnaire ou Propriétaire : StepHousingCount
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

      // Agence : StepHousingCount (step 7)
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
        // Propriétaire non-débutant : StepOccupation
        if (!isProprietaireDebutant(data.role, data.situation)) {
          return (
            <StepOccupation
              logements={data.logements}
              onChange={(logements) => setData((d) => ({ ...d, logements }))}
              onNext={next}
            />
          );
        }
        // Propriétaire débutant : saute Occupation, va à Complete
        return null;

      // Agence/Gestionnaire : StepOccupation (step 8)
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
        // Propriétaire non-débutant : StepPaiement
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

      // Agence : StepPaiement (step 9) - Gestionnaire skips this
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
        // Gestionnaire goes directly to Complete
        if (data.role === "gestionnaire") {
          return null;
        }
        return null;

      // Complete : toujours le dernier step
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
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
