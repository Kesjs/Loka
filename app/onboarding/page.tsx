"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepRole from "@/components/onboarding/StepRole";
import StepSituation from "@/components/onboarding/StepSituation";
import StepAgenceInfo from "@/components/onboarding/StepAgenceInfo";
import StepProprietaireGere from "@/components/onboarding/StepProprietaireGere";
import StepProperty from "@/components/onboarding/StepProperty";
import StepHousingCount from "@/components/onboarding/StepHousingCount";
import StepOccupation from "@/components/onboarding/StepOccupation";
import StepPaiement from "@/components/onboarding/StepPaiement";
import StepComplete from "@/components/onboarding/StepComplete";
import {
  OnboardingData,
  initialOnboardingData,
  getStepSequence,
  StepType,
} from "@/components/onboarding/types";
import { createClient } from "@/lib/supabase/client";
import { saveOnboarding } from "@/lib/onboarding-save";
import {
  loadOnboardingDraft,
  deleteDraft,
  createAutoSaveFunction,
} from "@/lib/onboarding-draft";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveFunctionRef = useRef<((step: number, data: OnboardingData) => Promise<void>) | null>(null);

  const stepSequence = getStepSequence(data.role, data.situation);
  const totalSteps = stepSequence.length;

  // Ajuster l'étape courante si la séquence rétrécit suite à un changement de rôle
  useEffect(() => {
    if (step >= totalSteps) {
      setStep(Math.max(totalSteps - 1, 0));
    }
  }, [totalSteps, step]);

  // Charger le brouillon au montage
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const draft = await loadOnboardingDraft(supabase);
      
      if (draft) {
        setStep(draft.step);
        setData(draft.data);
      }
      
      setIsLoading(false);
      
      // Initialiser auto-save
      autoSaveFunctionRef.current = createAutoSaveFunction(supabase, 30000);
    })();
  }, []);

  // Auto-save avec débounce
  useEffect(() => {
    if (isLoading) return;
    autoSaveFunctionRef.current?.(step, data);
  }, [step, data, isLoading]);

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

    // Supprimer le brouillon après complétion réussie
    await deleteDraft(supabase);

    router.push("/home");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600 mx-auto" />
          <p className="text-neutral-600">Chargement de votre onboarding...</p>
        </div>
      </div>
    );
  }

  const currentStepType: StepType = stepSequence[step] || "welcome";

  function renderStep() {
    switch (currentStepType) {
      case "welcome":
        return (
          <StepWelcome
            value={data.profil}
            onChange={(v) => setData((d) => ({ ...d, profil: v }))}
            onNext={next}
          />
        );

      case "role":
        return (
          <StepRole
            value={data.role}
            onChange={(v) => setData((d) => ({ ...d, role: v, situation: null, roleInterne: undefined }))}
            onNext={next}
          />
        );

      case "situation":
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

      case "agence_info":
        return (
          <StepAgenceInfo
            value={data.agenceInfo}
            onChange={(v) => setData((d) => ({ ...d, agenceInfo: v }))}
            onNext={next}
          />
        );

      case "proprietaire_gere":
        return (
          <StepProprietaireGere
            value={data.proprietaireGere}
            onChange={(v) => setData((d) => ({ ...d, proprietaireGere: v }))}
            onNext={next}
          />
        );

      case "property":
        return (
          <StepProperty
            value={data.bien}
            onChange={(v) => setData((d) => ({ ...d, bien: v }))}
            onNext={next}
          />
        );

      case "housing_count":
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

      case "occupation":
        return (
          <StepOccupation
            logements={data.logements}
            onChange={(logements) => setData((d) => ({ ...d, logements }))}
            onNext={next}
          />
        );

      case "paiement":
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

      case "complete":
        return (
          <StepComplete
            onFinish={handleFinish}
            loading={finishing}
            error={finishError}
            data={data}
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
      role={data.role}
      situation={data.situation}
      onPrev={prev}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${currentStepType}`}
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
