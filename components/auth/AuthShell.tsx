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
      {/* Panneau gauche — sticky sur desktop */}
      <div className="relative hidden md:flex md:w-[46%] lg:w-[44%] md:sticky md:top-0 md:h-screen md:flex-shrink-0 overflow-hidden bg-gradient-to-br from-neutral-950 via-slate-900 to-primary-950 md:flex-col">
        {/* Motif Grille Technique ultra-subtil */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
          aria-hidden
        />

        {/* Halos Lumineux Mesh Gradient d'Arrière-Plan */}
        <div
          className="absolute -top-32 -left-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-primary-600/30 to-amber-500/20 blur-[100px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute bottom-10 -right-20 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-emerald-500/20 to-primary-700/25 blur-[120px] pointer-events-none"
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

          {/* Section centrale : Titre & Carte contextuelle sobre (sans glassmorphism) */}
          <div className="my-auto space-y-6 pt-6">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              key={leftTitle}
            >
              <h1 className="text-3xl font-black leading-tight tracking-tight text-white lg:text-4xl">
                {leftTitle}
              </h1>
              <p className="text-base leading-relaxed text-slate-300">
                {leftSubtitle}
              </p>
            </motion.div>

            {/* Carte contextuelle épurée et solide — haute lisibilité */}
            {stepCard && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepCard.badge + stepCard.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-400">
                      {stepCard.badge}
                    </span>
                    {stepCard.highlightValue && (
                      <span className="inline-flex items-center gap-1 rounded bg-primary-950/90 px-2.5 py-0.5 text-xs font-bold text-primary-300 border border-primary-800/60">
                        <Lightning size={12} weight="fill" className="text-amber-400" />
                        {stepCard.highlightValue}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {stepCard.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {stepCard.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Section basse : Preuve sociale avec vraies photos d'avatars africains & micro-badges */}
          <div className="space-y-4 border-t border-slate-800/90 pt-6">
            {/* Stack d'avatars africains réels & message de confiance */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 shrink-0">
                <Image
                  src="/auth/avatar-1.png"
                  alt="Utilisateur Loka"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-950"
                />
                <Image
                  src="/auth/avatar-2.png"
                  alt="Utilisateur Loka"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-950"
                />
                <Image
                  src="/auth/avatar-3.png"
                  alt="Utilisateur Loka"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-950"
                />
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-primary-300 ring-2 ring-neutral-950 border border-slate-700">
                  +500
                </div>
              </div>
              <p className="text-xs font-medium leading-snug text-slate-300">
                <span className="font-bold text-white">+500 bailleurs & agences</span> à Cotonou, Calavi & Porto-Novo.
              </p>
            </div>

            {/* Micro-badges de réassurance sobres */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-2 text-[11px] text-slate-300">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" weight="fill" />
                <span className="truncate">Normes ARCEP</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-2 text-[11px] text-slate-300">
                <Lightning size={14} className="text-amber-400 shrink-0" weight="fill" />
                <span className="truncate">Quittances 1-Clic</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-2 text-[11px] text-slate-300">
                <TrendUp size={14} className="text-primary-400 shrink-0" weight="bold" />
                <span className="truncate">99% Collectés</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col min-h-screen px-4 pb-12 pt-8 md:px-10 md:pt-12 lg:px-14 xl:px-20">
        <div className="w-full max-w-2xl mx-auto">
          {/* Logo mobile */}
          <div className="mb-8 flex flex-col items-center gap-3 md:hidden">
            <BrandLockup variant="on-light" size="md" showWordmark />
          </div>

          {showBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <ArrowLeft size={16} weight="bold" />
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

          {/* Onglets avec typographie plus affirmée */}
          {showTabs && activeTab && onTabChange && (
            <div className="mb-6 flex gap-2 border-b border-neutral-200">
              {[
                { id: "signin", label: AUTH_MESSAGES.navigation.signIn },
                { id: "signup", label: AUTH_MESSAGES.navigation.signUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as AuthTab)}
                  className={`relative px-4 py-3 text-base font-bold transition-colors ${
                    activeTab === tab.id
                      ? "text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-700"
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
                <h2 className="text-3xl font-black tracking-tight text-neutral-900">{rightTitle}</h2>
              )}
              {rightSubtitle && (
                <p className="mt-1.5 text-sm text-neutral-500">{rightSubtitle}</p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            {rightHint && (
              <p className="mb-5 text-sm font-medium text-neutral-600">{rightHint}</p>
            )}
            {children}
          </div>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}


