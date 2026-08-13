"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";
import AuthProgressBar from "./AuthProgressBar";
import BackToHomeLink from "./BackToHomeLink";
import { AUTH_MESSAGES } from "@/lib/auth-messages";
import { Role } from "@/components/onboarding/types";
import StepRail, { StepRailItem } from "@/components/onboarding/StepRail";

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
  /**
   * Rail d'étapes de l'onboarding. Quand fourni, remplace le média vidéo/image
   * du panneau droit par un rail vertical sur fond vert transparent (desktop),
   * et affiche un rail horizontal compact en haut du formulaire (mobile).
   */
  stepRail?: {
    items: StepRailItem[];
    currentIndex: number;
    onNavigate?: (index: number) => void;
  };
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
  progress,
  showTabs,
  activeTab,
  onTabChange,
  media = DEFAULT_MEDIA,
  stepRail,
}: AuthShellProps) {
  // stepCard (getStepContextCard) est conservé pour compatibilité mais n'est plus
  // rendu directement ici — OnboardingLayout fournit désormais leftTitle/leftSubtitle
  // via getStepCopy, seule source de vérité pour l'onboarding.

  return (
    <div className="flex min-h-screen bg-white md:h-screen md:flex-row md:overflow-hidden">
      {/* Colonne gauche — formulaire 40% */}
      <div className="flex flex-col px-6 py-8 md:h-screen md:overflow-y-auto w-full md:w-[40%] md:px-8 md:py-10 lg:px-10">
        {/* Retour à l'accueil — même composant/animation que la page /auth */}
        <BackToHomeLink />

        {/* Rail compact — mobile uniquement, en haut du formulaire */}
        {stepRail && (
          <div className="mb-6 -mx-1 md:hidden">
            <StepRail
              items={stepRail.items}
              currentIndex={stepRail.currentIndex}
              onNavigate={stepRail.onNavigate}
              orientation="horizontal"
            />
          </div>
        )}
        <div className="w-full mx-auto md:mx-0 my-auto">
          {/* Texte + sous-texte — style Claude */}
          <motion.div
            className="mb-8 space-y-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            key={leftTitle}
          >
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              {leftTitle}
            </h1>
            <p className="text-sm text-neutral-600">
              {leftSubtitle}
            </p>
            {leftFootnote && (
              <p className="text-xs text-neutral-500">{leftFootnote}</p>
            )}
          </motion.div>

          {/* Onglets connexion/inscription */}
          {showTabs && activeTab && onTabChange && (
            <div className="mb-6 mt-6 flex gap-6 border-b border-neutral-200">
              {[
                { id: "signin", label: AUTH_MESSAGES.navigation.signIn },
                { id: "signup", label: AUTH_MESSAGES.navigation.signUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as AuthTab)}
                  className={`relative px-1 py-3 text-sm font-bold transition-colors ${
                    activeTab === tab.id
                      ? "text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="absolute bottom-0 left-1 right-1 h-1 bg-primary-600 rounded-t"
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {(rightTitle || rightSubtitle) && !showTabs && (
            <div className="mb-4 mt-5">
              {rightTitle && (
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">{rightTitle}</h2>
              )}
              {rightSubtitle && (
                <p className="mt-1 text-sm text-neutral-500">{rightSubtitle}</p>
              )}
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-4">
            {rightHint && (
              <p className="mb-4 text-sm font-medium text-neutral-600">{rightHint}</p>
            )}
            {children}
          </div>

          {footer && <div className="mt-6 text-neutral-500">{footer}</div>}
        </div>
      </div>

      {/* Colonne droite — 60% */}
      {stepRail ? (
        <div className="relative hidden md:flex md:w-[60%] md:h-screen flex-col justify-center overflow-hidden bg-neutral-900 px-12 lg:px-16">
          {/* Overlay vert très transparent, jamais un aplat saturé */}
          <div className="pointer-events-none absolute inset-0 bg-primary-500/[0.18]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(8,127,91,0.25), transparent 55%)",
            }}
          />
          <div className="relative z-10 max-w-sm">
            <StepRail
              items={stepRail.items}
              currentIndex={stepRail.currentIndex}
              onNavigate={stepRail.onNavigate}
              orientation="vertical"
            />
          </div>
        </div>
      ) : (
        <div className="relative hidden md:block md:w-[60%] md:h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
          {media.type === "video" ? (
            <video
              src={media.src}
              poster={media.poster}
              className="absolute inset-0 h-full w-full object-cover"
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
      )}
    </div>
  );
}
