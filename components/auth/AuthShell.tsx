"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import BrandLockup from "./BrandLockup";
import AuthProgressBar from "./AuthProgressBar";
import { AUTH_MESSAGES } from "@/lib/auth-messages";

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
  progress,
  showTabs,
  activeTab,
  onTabChange,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
      {/* Panneau gauche — photo hero + overlay slate */}
      <div className="relative hidden min-h-screen overflow-hidden md:flex md:w-[44%] md:flex-col">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="44vw"
        />
        {/* Overlay pour lisibilité du texte et continuité avec la sidebar */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-neutral-900/92 via-neutral-900/78 to-primary-900/85"
          aria-hidden
        />
        {/* Accent terracotta discret */}
        <div
          className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col p-8 lg:p-12">
          <BrandLockup variant="on-dark" size="md" />

          <motion.div
            className="mt-auto max-w-md space-y-5 pb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            key={leftTitle}
          >
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white lg:text-4xl">
                {leftTitle}
              </h1>
              <p className="text-base leading-relaxed text-neutral-300">
                {leftSubtitle}
              </p>
            </div>

            {leftFootnote && (
              <p className="border-t border-white/10 pt-4 text-sm text-accent-300">
                {leftFootnote}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:w-[56%] md:px-10 lg:px-14">
        <div className="w-full max-w-[420px]">
          {/* Logo mobile — fond blanc géré par BrandLockup */}
          <div className="mb-8 flex justify-center md:hidden">
            <BrandLockup variant="on-light" size="md" />
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
