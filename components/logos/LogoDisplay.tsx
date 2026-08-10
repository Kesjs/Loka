"use client";

/**
 * components/logos/LogoDisplay.tsx
 * 
 * Composant pour afficher le logo d'une organisation
 * Utilisé sur:
 * - Pages profil organisation
 * - Dashboard header
 * - Quittances (fallback si API génère pas le logo)
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getLogoUrl } from "@/lib/storage/logos";

interface LogoDisplayProps {
  organisationId: string;
  fallbackName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LogoDisplay({
  organisationId,
  fallbackName = "Logo",
  size = "md",
  className = "",
}: LogoDisplayProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const supabase = createClient();
        const url = await getLogoUrl(supabase, organisationId);
        setLogoUrl(url);
      } catch (error) {
        console.warn("Erreur chargement logo:", error);
        setLogoUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [organisationId]);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-48 w-48",
  };

  if (loading) {
    return (
      <div
        className={`${sizeClasses[size]} animate-pulse rounded-lg bg-neutral-200 ${className}`}
      />
    );
  }

  if (logoUrl) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden ${className}`}>
        <Image
          src={logoUrl}
          alt={fallbackName}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100px, 200px"
        />
      </div>
    );
  }

  // Fallback: afficher les initiales dans un badge
  const initials = fallbackName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ${className}`}
    >
      <span className="text-lg font-bold text-white">{initials}</span>
    </div>
  );
}
