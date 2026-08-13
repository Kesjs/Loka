"use client";

import { motion } from "framer-motion";

interface OnboardingStepperProps {
  current: number;
  total: number;
  label: string;
  title: string;
  onNavigate?: (index: number) => void;
}

/**
 * Stepper horizontal compact affiché uniquement pendant l'onboarding —
 * jamais pendant connexion/inscription. Points reliés par une ligne de
 * progression qui se remplit avec un layoutId Framer Motion (glissement
 * fluide plutôt qu'un saut), puis le titre de l'étape en grand en dessous.
 */
export default function OnboardingStepper({
  current,
  total,
  label,
  title,
  onNavigate,
}: OnboardingStepperProps) {
  return (
    <div className="mb-9">
      <div className="flex items-center" role="list" aria-label="Progression de la configuration">
        {Array.from({ length: total }).map((_, index) => {
          const state = index < current - 1 ? "done" : index === current - 1 ? "active" : "upcoming";
          const clickable = state === "done" && !!onNavigate;
          const isLast = index === total - 1;

          return (
            <div key={index} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                role="listitem"
                disabled={!clickable}
                onClick={() => clickable && onNavigate?.(index)}
                aria-current={state === "active" ? "step" : undefined}
                aria-label={`Étape ${index + 1} sur ${total}`}
                className={`relative flex shrink-0 items-center justify-center rounded-full transition-all ${
                  state === "active" ? "h-3 w-3" : "h-2.5 w-2.5"
                } ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`absolute inset-0 rounded-full transition-colors ${
                    state === "done"
                      ? "bg-primary-600"
                      : state === "active"
                      ? "bg-white ring-2 ring-primary-600"
                      : "bg-neutral-200"
                  }`}
                />
                {state === "active" && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary-600/30"
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </button>
              {!isLast && (
                <div className="relative mx-1.5 h-[2px] flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary-600"
                    initial={false}
                    animate={{ width: index < current - 1 ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
        Étape {current} sur {total} · {label}
      </p>

      <motion.h1
        key={title}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mt-2 text-3xl font-light tracking-tight text-neutral-900"
      >
        {title}
      </motion.h1>
    </div>
  );
}
