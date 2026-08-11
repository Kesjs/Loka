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
    <div className="flex min-h-screen bg-white md:h-screen md:flex-row md:overflow-hidden">
      {/* Colonne gauche — formulaire 40% */}
      <div className="flex flex-col px-6 py-8 md:h-screen md:overflow-y-auto w-full md:w-[40%] md:px-8 md:py-10 lg:px-10">
        <div className="w-full mx-auto md:mx-0 my-auto">
          {/* Logo + Header */}
          <div className="mb-6 md:mb-8">
            <BrandLockup variant="on-light" size="md" showWordmark />
          </div>

          {/* Texte + sous-texte — style Claude */}
          <motion.div
            className="mb-8 space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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
                      transition={{ duration: 0.3 }}
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

      {/* Colonne droite — 60% vidéo/image */}
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
    </div>
  );
}
