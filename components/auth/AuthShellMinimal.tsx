"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import BrandLockup from "./BrandLockup";
import AuthProgressBar from "./AuthProgressBar";
import { AUTH_MESSAGES } from "@/lib/auth-messages";
import { getStepContextCard } from "@/lib/auth-copy";
import { Role, Situation } from "@/components/onboarding/types";

type AuthTab = "signin" | "signup" | "forgot-password";

export type AuthShellMedia =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string; alt?: string };

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

export default function AuthShellMinimal({
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
      {/* Colonne gauche — formulaire 60% */}
      <div className="flex flex-1 flex-col px-8 py-12 md:h-screen md:w-[60%] md:px-16 md:py-16 lg:px-24">
        <div className="w-full mx-auto md:mx-0 my-auto max-w-md">
          {/* Logo + Header */}
          <div className="mb-10">
            <BrandLockup variant="on-light" size="md" showWordmark />
          </div>

          {/* Texte + sous-texte — Minimalist style */}
          <motion.div
            className="mb-10 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            key={leftTitle}
          >
            <h1 className="text-4xl font-light tracking-tight text-neutral-900 leading-tight">
              {leftTitle}
            </h1>
            <p className="text-base text-neutral-500 font-light leading-relaxed">
              {leftSubtitle}
            </p>
            {leftFootnote && (
              <p className="text-sm text-neutral-400 font-light">{leftFootnote}</p>
            )}
          </motion.div>

          {/* Formulaire */}
          <div className="space-y-5">
            {rightHint && (
              <p className="mb-4 text-sm text-neutral-500 font-light">{rightHint}</p>
            )}
            {children}
          </div>

          {footer && <div className="mt-8 text-neutral-400 text-sm font-light">{footer}</div>}
        </div>
      </div>

      {/* Colonne droite — 40% vidéo réduite centrée */}
      <div className="relative hidden md:flex md:w-[40%] md:h-screen md:items-center md:justify-center bg-neutral-50">
        <div className="relative w-[80%] max-w-md aspect-[4/5] overflow-hidden rounded-2xl shadow-lg">
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
          
          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-white/5" />
        </div>
      </div>
    </div>
  );
}
