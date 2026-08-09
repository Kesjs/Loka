"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Lightning, Sparkle, TrendUp } from "@phosphor-icons/react";
import BrandLockup from "./BrandLockup";
import AuthProgressBar from "./AuthProgressBar";
import { AUTH_MESSAGES } from "@/lib/auth-messages";
import { getStepContextCard } from "@/lib/auth-copy";
import { Role, Situation } from "@/components/onboarding/types";

const HERO_IMAGE = "/auth/hero.webp";

type AuthTab = "signin" | "signup" | "forgot-password";

interface AuthShellProps {
  children: ReactNode;
  leftTitle: string;
  leftSubtitle: string;
  leftFootnote?: string;
  rightTitle?: string;
  rightSubtitle?: string;
  rightHint?: string;
  footer?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  step?: number;
  role?: Role | null;
  situation?: Situation | null;
  progress?: {
    current: number;
    total: number;
    label: string;
    percent: number;
  };
  showTabs?: boolean;
  activeTab?: AuthTab;
  onTabChange?: (tab: AuthTab) => void;
}

export default function AuthShell({
  children,
  leftTitle,
  leftSubtitle,
  leftFootnote,
  rightTitle,
  rightSubtitle,
  rightHint,
  footer,
  showBack,
  onBack,
  step,
  role = null,
  situation = null,
  progress,
  showTabs,
  activeTab,
  onTabChange,
}: AuthShellProps) {
  const stepCard = step !== undefined ? getStepContextCard(step, role, situation) : null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
      {/* Panneau gauche — photo hero + overlay + carte contextuelle (Prop 4) & preuve sociale (Prop 2) */}
      <div className="relative hidden min-h-screen overflow-hidden md:flex md:w-[46%] md:flex-col lg:w-[44%]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="44vw"
        />
        {/* Overlay somptueux avec gradient profond */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-neutral-950/92 via-neutral-900/85 to-primary-950/95"
          aria-hidden
        />

        {/* Halos lumineux d'ambiance */}
        <div
          className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-primary-600/25 blur-3xl pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute top-12 -right-12 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
          {/* En-tête : BrandLockup & Badge Bénin */}
          <div className="flex items-center justify-between">
            <BrandLockup variant="on-dark" size="md" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md">
              <Sparkle size={12} weight="fill" className="text-amber-400" />
              Bénin 🇧🇯
            </span>
          </div>

          {/* Section centrale : Titre & Carte contextuelle dynamique (Proposition 4) */}
          <div className="my-auto space-y-6 pt-6">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              key={leftTitle}
            >
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl">
                {leftTitle}
              </h1>
              <p className="text-base leading-relaxed text-neutral-300">
                {leftSubtitle}
              </p>
            </motion.div>

            {/* Carte contextuelle en Glassmorphism (Proposition 4) */}
            {stepCard && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepCard.badge + stepCard.title}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-2xl transition-all hover:border-white/30 hover:bg-white/[0.13]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-300">
                      {stepCard.badge}
                    </span>
                    {stepCard.highlightValue && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary-500/20 px-2 py-0.5 text-xs font-semibold text-primary-200 border border-primary-400/20">
                        <Lightning size={12} weight="fill" className="text-amber-400" />
                        {stepCard.highlightValue}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary-100 transition-colors">
                    {stepCard.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                    {stepCard.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Section basse : Preuve sociale & Chiffres clés (Proposition 2) */}
          <div className="space-y-4 border-t border-white/10 pt-6">
            {/* Stack d'avatars & confiance */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-xs font-bold text-neutral-900 ring-2 ring-neutral-950">
                  MD
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-xs font-bold text-white ring-2 ring-neutral-950">
                  AK
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-xs font-bold text-white ring-2 ring-neutral-950">
                  JS
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-950 text-[10px] font-bold text-primary-300 ring-2 ring-neutral-950 border border-white/20">
                  +500
                </div>
              </div>
              <p className="text-xs font-medium leading-snug text-neutral-300">
                <span className="font-bold text-white">+500 bailleurs & agences</span> à Cotonou, Calavi & Porto-Novo.
              </p>
            </div>

            {/* Micro-badges de réassurance */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-neutral-300">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" weight="fill" />
                <span className="truncate">Normes ARCEP</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-neutral-300">
                <Lightning size={14} className="text-amber-400 shrink-0" weight="fill" />
                <span className="truncate">Quittance 1-Clic</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-neutral-300">
                <TrendUp size={14} className="text-primary-400 shrink-0" weight="bold" />
                <span className="truncate">99% Collectés</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:w-[54%] md:px-10 lg:w-[56%] lg:px-14">
        <div className="w-full max-w-[420px]">
          {/* Logo mobile — empilé verticalement */}
          <div className="mb-8 flex flex-col items-center gap-3 md:hidden">
            <BrandLockup variant="on-light" size="md" showWordmark={false} />
            <div className="text-center leading-tight">
              <span className="block text-sm font-bold text-neutral-900">
                Saint Pierre
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Immobilier
              </span>
            </div>
          </div>

          {showBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              <ArrowLeft size={14} />
              Retour
            </button>
          )}

          {progress && (
            <AuthProgressBar
              current={progress.current}
              total={progress.total}
              label={progress.label}
              percent={progress.percent}
            />
          )}

          {/* Onglets */}
          {showTabs && activeTab && onTabChange && (
            <div className="mb-6 flex gap-2 border-b border-neutral-200">
              {[
                { id: "signin", label: AUTH_MESSAGES.navigation.signIn },
                { id: "signup", label: AUTH_MESSAGES.navigation.signUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as AuthTab)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-600"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {(rightTitle || rightSubtitle) && !showTabs && (
            <div className="mb-6">
              {rightTitle && (
                <h2 className="text-2xl font-bold text-neutral-900">{rightTitle}</h2>
              )}
              {rightSubtitle && (
                <p className="mt-1 text-sm text-neutral-500">{rightSubtitle}</p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            {rightHint && (
              <p className="mb-5 text-sm text-neutral-500">{rightHint}</p>
            )}
            {children}
          </div>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

