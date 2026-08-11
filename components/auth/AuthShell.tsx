"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkle } from "@phosphor-icons/react";
import BrandLockup from "./BrandLockup";
import AuthProgressBar from "./AuthProgressBar";
import { AUTH_MESSAGES } from "@/lib/auth-messages";
import { getStepContextCard } from "@/lib/auth-copy";
import { Role, Situation } from "@/components/onboarding/types";

type AuthTab = "signin" | "signup" | "forgot-password";

export type AuthShellMedia =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string; alt?: string };

// Vidéo par défaut pour connexion/inscription — dépose ton fichier local
// dans /public/auth/login.mp4 (+ une image d'accroche /public/auth/login-poster.jpg).
// Fallback sur hero.webp tant que login-poster.jpg n'existe pas, pour éviter
// un cadre noir le temps que la vidéo charge.
const DEFAULT_MEDIA: AuthShellMedia = {
  type: "video",
  src: "/auth/login.mp4",
  poster: "/auth/hero.webp",
};

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
  media?: AuthShellMedia;
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
  media = DEFAULT_MEDIA,
}: AuthShellProps) {
  const stepCard = step !== undefined ? getStepContextCard(step, role, situation) : null;

  return (
    <div className="flex min-h-screen flex-col bg-white md:h-screen md:flex-row md:overflow-hidden">
      {/* Colonne gauche — hero + formulaire, fond blanc, scroll interne seulement si le contenu dépasse */}
      <div className="flex flex-1 flex-col px-5 pb-12 pt-8 md:h-screen md:overflow-y-auto md:px-10 md:pt-10 lg:px-16 xl:px-20">
        <div className="w-full max-w-md mx-auto md:mx-0 md:max-w-lg md:my-auto md:py-8">
          {/* En-tête : logo + badge, toujours visible (mobile et desktop) */}
          <div className="mb-8 flex items-center justify-between md:mb-10">
            <BrandLockup variant="on-light" size="md" showWordmark />
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 sm:inline-flex">
              <Sparkle size={12} weight="fill" className="text-amber-500" />
              Bénin 🇧🇯
            </span>
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

          {/* Titre hero + sous-titre */}
          <motion.div
            className="space-y-2.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            key={leftTitle}
          >
            <h1 className="text-3xl font-black leading-tight tracking-tight text-neutral-900 lg:text-[2.75rem]">
              {leftTitle}
            </h1>
            <p className="text-base leading-relaxed text-neutral-500">
              {leftSubtitle}
            </p>
            {leftFootnote && (
              <p className="text-xs text-neutral-400">{leftFootnote}</p>
            )}
          </motion.div>

          {/* Carte contextuelle façon "grande boîte" premium */}
          {stepCard && (
            <AnimatePresence mode="wait">
              <motion.div
                key={stepCard.badge}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600">
                  {stepCard.badge}
                </span>
                <p className="mt-2 text-sm leading-snug text-neutral-600">{stepCard.description}</p>
                {stepCard.highlightLabel && stepCard.highlightValue && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">{stepCard.highlightLabel}</span>
                    <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-neutral-900 border border-neutral-200">
                      {stepCard.highlightValue}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {progress && (
            <div className="mt-6">
              <AuthProgressBar
                current={progress.current}
                total={progress.total}
                label={progress.label}
                percent={progress.percent}
              />
            </div>
          )}

          {/* Onglets connexion/inscription */}
          {showTabs && activeTab && onTabChange && (
            <div className="mb-6 mt-7 flex gap-2 border-b border-neutral-200">
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
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {(rightTitle || rightSubtitle) && !showTabs && (
            <div className="mb-6 mt-7">
              {rightTitle && (
                <h2 className="text-2xl font-black tracking-tight text-neutral-900">{rightTitle}</h2>
              )}
              {rightSubtitle && (
                <p className="mt-1.5 text-sm text-neutral-500">{rightSubtitle}</p>
              )}
            </div>
          )}

          {/* Carte du formulaire */}
          <div className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 ${!showTabs && !(rightTitle || rightSubtitle) ? "mt-7" : ""}`}>
            {rightHint && (
              <p className="mb-5 text-sm font-medium text-neutral-600">{rightHint}</p>
            )}
            {children}
          </div>

          {footer && <div className="mt-6 text-neutral-500">{footer}</div>}
        </div>
      </div>

      {/* Colonne droite — média flottant, isolé, sans texte ni overlay */}
      <div className="relative hidden md:flex md:w-[46%] lg:w-[44%] md:h-screen md:flex-shrink-0 md:items-center md:justify-center bg-neutral-50 p-6 lg:p-10">
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-neutral-200">
          {media.type === "video" ? (
            <video
              src={media.src}
              poster={media.poster}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <Image
              src={media.src}
              alt={media.alt ?? ""}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
      </div>
    </div>
  );
}
