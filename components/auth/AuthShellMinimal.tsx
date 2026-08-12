"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
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
      {/* Colonne gauche — formulaire 40% */}
      <div className="flex flex-1 flex-col px-8 py-12 md:h-screen md:w-[40%] md:px-16 md:py-16 lg:px-24">
        <div className="w-full mx-auto md:mx-0 my-auto max-w-md">
          {/* Retour à l'accueil — animation façon Stripe */}
          <Link
            href="/"
            className="group mb-10 inline-flex w-fit items-center gap-2 text-sm font-light text-neutral-500 no-underline transition-colors duration-200 hover:text-neutral-900 hover:no-underline"
          >
            <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden">
              <ArrowLeft
                size={16}
                className="absolute transition-transform duration-300 ease-out group-hover:-translate-x-5"
              />
              <ArrowLeft
                size={16}
                className="absolute translate-x-5 transition-transform duration-300 ease-out group-hover:translate-x-0"
              />
            </span>
            <span className="relative">
              Retour à l&apos;accueil
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-neutral-900 transition-all duration-300 ease-out group-hover:w-full" />
            </span>
          </Link>

          {/* Texte + sous-texte — Minimalist style */}
          <motion.div
            className="mb-10 space-y-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
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

      {/* Colonne droite — vidéo 60%, plein cadre */}
      <div className="relative hidden md:block md:w-[60%] md:h-screen overflow-hidden bg-neutral-50">
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
