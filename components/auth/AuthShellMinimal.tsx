"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import BackToHomeLink from "./BackToHomeLink";

interface AuthShellProps {
  children: ReactNode;
  leftTitle: string;
  leftSubtitle: string;
  leftFootnote?: string;
  rightHint?: string;
  footer?: ReactNode;
}

/**
 * Panneau de contenu gauche pour /auth (connexion, inscription, mot de
 * passe oublié). La vidéo de droite vient du layout partagé
 * app/(auth-flow)/layout.tsx — ce composant ne gère plus que le texte et
 * le formulaire.
 */
export default function AuthShellMinimal({
  children,
  leftTitle,
  leftSubtitle,
  leftFootnote,
  rightHint,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-col px-6 py-10 sm:px-10 sm:py-12 md:px-16 md:py-16 lg:px-24">
      <div className="mx-auto my-auto w-full max-w-md">
        {/* Retour à l'accueil — animation façon Stripe */}
        <BackToHomeLink />

        {/* Texte + sous-texte */}
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
  );
}
