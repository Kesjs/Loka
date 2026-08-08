"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import ProgressDots from "@/components/onboarding/ProgressDots";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepObjective from "@/components/onboarding/StepObjective";
import StepProfile from "@/components/onboarding/StepProfile";
import StepProperty from "@/components/onboarding/StepProperty";
import StepHousingCount from "@/components/onboarding/StepHousingCount";
import StepOccupation from "@/components/onboarding/StepOccupation";
import StepPreferencesPayment from "@/components/onboarding/StepPreferencesPayment";
import StepPreferencesGuarantee from "@/components/onboarding/StepPreferencesGuarantee";
import StepPreferencesApp from "@/components/onboarding/StepPreferencesApp";
import StepComplete from "@/components/onboarding/StepComplete";
import {
  OnboardingData,
  initialOnboardingData,
  TOTAL_STEPS,
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(() => loadDraft()?.step ?? 0);
  const [data, setData] = useState<OnboardingData>(() => loadDraft()?.data ?? initialOnboardingData);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");

  // Sauvegarde locale à chaque étape : évite de tout perdre si l'app
  // se ferme ou plante avant l'écran final (seul moment où saveOnboarding
  // écrit en base).
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }));
  }, [step, data]);

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
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

  function toggleCharge(charge: string) {
    setData((d) => {
      const has = d.preferences.charges.includes(charge);
      const charges = has
        ? d.preferences.charges.filter((c) => c !== charge)
        : [...d.preferences.charges, charge];
      return { ...d, preferences: { ...d.preferences, charges } };
    });
  }

  function renderStep() {
    switch (step) {
      case 0:
        return <StepWelcome onNext={next} />;

      case 1:
        return (
          <StepObjective
            value={data.objectif}
            onChange={(v) => setData((d) => ({ ...d, objectif: v }))}
            onNext={next}
          />
        );

      case 2:
        return (
          <StepProfile
            value={data.profil}
            onChange={(v) => setData((d) => ({ ...d, profil: v }))}
            onNext={next}
          />
        );

      case 3:
        return (
          <StepProperty
            value={data.bien}
            onChange={(v) => setData((d) => ({ ...d, bien: v }))}
            onNext={next}
          />
        );

      case 4:
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

      case 5:
        return (
          <StepOccupation
            logements={data.logements}
            onChange={(logements) => setData((d) => ({ ...d, logements }))}
            onNext={next}
          />
        );

      case 6:
        return (
          <StepPreferencesPayment
            frequenceLoyer={data.preferences.frequenceLoyer}
            jourEcheance={data.preferences.jourEcheance}
            onChangeFrequence={(v) =>
              setData((d) => ({
                ...d,
                preferences: { ...d.preferences, frequenceLoyer: v },
              }))
            }
            onChangeJour={(v) =>
              setData((d) => ({
                ...d,
                preferences: { ...d.preferences, jourEcheance: v },
              }))
            }
            onNext={next}
          />
        );

      case 7:
        return (
          <StepPreferencesGuarantee
            garantie={data.preferences.garantie}
            montantGarantie={data.preferences.montantGarantie}
            chargesIncluses={data.preferences.chargesIncluses}
            charges={data.preferences.charges}
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
            onChangeChargesIncluses={(v) =>
              setData((d) => ({
                ...d,
                preferences: { ...d.preferences, chargesIncluses: v },
              }))
            }
            onToggleCharge={toggleCharge}
            onNext={next}
          />
        );

      case 8:
        return (
          <StepPreferencesApp
            devise={data.preferences.devise}
            notifEmail={data.preferences.notifEmail}
            widgetPriorite={data.preferences.widgetPriorite}
            onChangeNotifEmail={(v) =>
              setData((d) => ({
                ...d,
                preferences: { ...d.preferences, notifEmail: v },
              }))
            }
            onChangeWidget={(v) =>
              setData((d) => ({
                ...d,
                preferences: { ...d.preferences, widgetPriorite: v },
              }))
            }
            onNext={next}
          />
        );

      case 9:
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Image
            src="/logo.jpg"
            alt="Saint Pierre Immobilier"
            width={48}
            height={48}
            className="mx-auto"
          />
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 overflow-hidden">
          {step > 0 && (
            <button
              type="button"
              onClick={prev}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              <ArrowLeft size={14} /> Retour
            </button>
          )}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <ProgressDots current={step} total={TOTAL_STEPS} />
          )}
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
        </div>
      </div>
    </div>
  );
}
