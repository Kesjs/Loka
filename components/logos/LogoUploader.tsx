"use client";

/**
 * components/logos/LogoUploader.tsx
 * 
 * Composant upload de logo réutilisable pour:
 * - Onboarding (StepAgenceInfo, etc.)
 * - Dashboard settings
 * - Pages organisation
 */

import { useState, useRef } from "react";
import { Upload, X } from "@phosphor-icons/react";
import { uploadLogo, deleteLogo, getLogoUrl } from "@/lib/storage/logos";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface LogoUploaderProps {
  organisationId: string;
  currentLogoUrl?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
}

export function LogoUploader({
  organisationId,
  currentLogoUrl,
  onUploadSuccess,
  onUploadError,
  size = "md",
  disabled = false,
  label = "Logo de l'organisation",
}: LogoUploaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-24 w-24",
    md: "h-32 w-32",
    lg: "h-48 w-48",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const result = await uploadLogo(supabase, organisationId, file);

      if (result.success && result.url) {
        setLogoUrl(result.url);
        onUploadSuccess?.(result.url);
      } else {
        const errorMsg = result.error || "Erreur lors de l'upload";
        setError(errorMsg);
        onUploadError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur serveur";
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const success = await deleteLogo(supabase, organisationId);

      if (success) {
        setLogoUrl(null);
        onUploadSuccess?.("");
      } else {
        const errorMsg = "Impossible de supprimer le logo";
        setError(errorMsg);
        onUploadError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur serveur";
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-900">
        {label}
      </label>

      {logoUrl ? (
        <div className="space-y-3">
          <div
            className={`relative ${sizeClasses[size]} rounded-lg border-2 border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center`}
          >
            <Image
              src={logoUrl}
              alt="Logo organisation"
              fill
              className="object-contain p-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
            >
              <Upload size={16} weight="bold" />
              Remplacer
            </button>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              <X size={16} weight="bold" />
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading}
          className={`relative w-full ${sizeClasses[size]} rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-400 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-2`}
        >
          <Upload
            size={32}
            weight="light"
            className="text-neutral-400"
          />
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-700">
              {loading ? "Upload en cours..." : "Cliquez pour uploader"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              PNG, JPG, WebP ou SVG — Max 5MB
            </p>
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        disabled={disabled || loading}
        className="hidden"
        aria-label="Logo upload"
      />

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Le logo sera utilisé sur les quittances et dans votre profil public.
      </p>
    </div>
  );
}
