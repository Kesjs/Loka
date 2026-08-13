"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BackToHomeLinkProps {
  className?: string;
  /**
   * "light" (défaut) : pour les pages auth à fond blanc (/login, /auth).
   * "dark" : pour les pages à fond sombre (ex. portail locataire /tenant/login)
   *          — texte clair et logo inversé en blanc pour rester visible.
   */
  variant?: "light" | "dark";
}

const VARIANT_STYLES = {
  light: {
    link: "text-neutral-500 hover:text-neutral-900",
    underline: "bg-neutral-900",
    logo: "",
  },
  dark: {
    link: "text-slate-400 hover:text-white",
    underline: "bg-white",
    logo: "brightness-0 invert",
  },
} as const;

/**
 * Lien "Retour à l'accueil" utilisé sur toutes les pages auth (/login, /auth
 * et le portail locataire /tenant/login).
 *
 * Au survol :
 * - la flèche glisse hors du cadre pendant que le logo Lokka glisse à sa
 *   place (animation façon Stripe, qui remplace son icône flèche par son
 *   propre logo au survol du bouton retour) ;
 * - le texte n'a qu'un seul soulignement, animé (barre qui se dessine de
 *   gauche à droite). Le soulignement natif du navigateur est désactivé
 *   explicitement en plus de la classe Tailwind, pour ne jamais dépendre
 *   de l'ordre des styles globaux.
 */
export default function BackToHomeLink({ className, variant = "light" }: BackToHomeLinkProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Link
      href="/"
      className={cn(
        "group mb-10 inline-flex w-fit items-center gap-2 text-sm font-light no-underline transition-colors duration-200 hover:no-underline",
        styles.link,
        className
      )}
      style={{ textDecoration: "none" }}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {/* Flèche — visible par défaut, sort par la gauche au survol */}
        <ArrowLeft
          size={16}
          className="absolute transition-all duration-300 ease-out group-hover:-translate-x-5 group-hover:opacity-0"
        />
        {/* Logo Lokka — entre par la droite au survol, comme sur Stripe */}
        <Image
          src="/Lokka-logo-transparent.png"
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
          className={cn(
            "absolute translate-x-5 object-contain opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100",
            styles.logo
          )}
        />
      </span>
      <span className="relative" style={{ textDecoration: "none" }}>
        Retour à l&apos;accueil
        <span
          className={cn(
            "absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 ease-out group-hover:w-full",
            styles.underline
          )}
        />
      </span>
    </Link>
  );
}
