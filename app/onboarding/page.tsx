"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
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
import {
  validateOnboardingData,
  sanitizeOnboardingData,
  formatValidationErrors,
} from "@/lib/onboarding-validation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDraft, setPendingDraft] = useState<{ step: number; data: OnboardingData } | null>(null);
  const autoSaveFunctionRef = useRef<((step: number, data: OnboardingData) => Promise<void>) | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const stepSequence = getStepSequence(data.role, data.situation);
  const totalSteps = stepSequence.length;

  // Ajuster l'étape courante si la séquence rétrécit suite à un changement de rôle
  useEffect(() => {
    if (step >= totalSteps) {
      setStep(Math.max(totalSteps - 1, 0));
    }
  }, [totalSteps, step]);

  // Charger le brouillon au montage — on ne l'applique jamais silencieusement,
  // on demande toujours à l'utilisateur s'il veut reprendre ou repartir de zéro.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      supabaseRef.current = supabase;
      const draft = await loadOnboardingDraft(supabase);

      // Un brouillon "vide" (jamais avancé) ne mérite pas qu'on interrompe l'utilisateur
      const draftIsMeaningful = draft && (draft.step > 0 || draft.data.role !== null);

      if (draftIsMeaningful) {
        setPendingDraft(draft);
      }

      // Récupérer les infos utilisateur depuis Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setData((d) => ({
          ...d,
          profil: {
            nom: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
            telephone: user.user_metadata?.phone || "",
            email: user.email || "",
          },
        }));
      }

      setIsLoading(false);

      // Initialiser auto-save
      autoSaveFunctionRef.current = createAutoSaveFunction(supabase, 30000);
    })();
  }, []);

  async function resumeDraft() {
    if (!pendingDraft) return;
    setStep(pendingDraft.step);
    setData(pendingDraft.data);
    setPendingDraft(null);
  }

  async function restartFresh() {
    setPendingDraft(null);
    setStep(0);
    setData(initialOnboardingData);
    if (supabaseRef.current) {
      await deleteDraft(supabaseRef.current);
    }
  }

  // Auto-save avec débounce — jamais tant que l'écran de reprise est affiché,
  // sinon on écraserait le brouillon existant avec les données vides par défaut.
  useEffect(() => {
    if (isLoading || pendingDraft) return;
    autoSaveFunctionRef.current?.(step, data);
  }, [step, data, isLoading, pendingDraft]);

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish() {
    setFinishing(true);
    setFinishError("");

    // 1. Validation côté client avant soumission
    const validationResult = validateOnboardingData(data);
    
    if (!validationResult.valid) {
      const errorMessage = formatValidationErrors(validationResult.errors);
      setFinishError(errorMessage);
      setFinishing(false);
      
      // Scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Sanitize les données avant envoi
    const sanitizedData = sanitizeOnboardingData(data);

    // 3. Sauvegarder en base de données
    const supabase = createClient();
    const { error } = await saveOnboarding(supabase, sanitizedData);

    if (error) {
      setFinishError(error);
      setFinishing(false);
      
      // Scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 4. Supprimer le brouillon après complétion réussie
    await deleteDraft(supabase);

    // 5. Redirection vers le dashboard
    router.push("/dashboard/home");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600 mx-auto" />
          <p className="text-neutral-600">Chargement de votre onboarding...</p>
        </div>
      </div>
    );
  }

  if (pendingDraft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-neutral-900">Reprendre où vous en étiez ?</h1>
            <p className="text-sm text-neutral-500">
              Vous avez commencé votre configuration (étape {pendingDraft.step + 1}). Vous pouvez continuer ou repartir de zéro.
            </p>
          </div>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={resumeDraft}
              className="w-full rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700"
            >
              Continuer où j&apos;en étais
            </button>
            <button
              type="button"
              onClick={restartFresh}
              className="w-full rounded-xl border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              Recommencer à zéro
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepType: StepType = stepSequence[step] || "role";

  function renderStep() {
    switch (currentStepType) {
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
