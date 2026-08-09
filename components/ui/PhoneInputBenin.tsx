"use client";

import { useState, useCallback } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";

interface PhoneInputBeninProps {
  /** Valeur normalisée stockée : "+22901XXXXXXXX" ou chaîne vide */
  value: string;
  /** Appelé à chaque frappe — normalized = "+22901XXXXXXXX", isValid = résultat libphonenumber */
  onChange: (normalized: string, isValid: boolean) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  id?: string;
  /** Si true, le champ est obligatoire */
  required?: boolean;
}

/**
 * Champ téléphone Bénin 🇧🇯
 * - Préfixe fixe non éditable : 🇧🇯 +229 (01)
 * - Saisie des 8 chiffres restants (pour totaliser 10 chiffres ARCEP Bénin : 01 XX XX XX XX)
 * - Validation via libphonenumber-js
 * - Stockage normalisé : +22901XXXXXXXX
 */
export default function PhoneInputBenin({
  value,
  onChange,
  disabled = false,
  className = "",
  inputClassName = "",
  onKeyDown,
  id,
  required = false,
}: PhoneInputBeninProps) {
  // Extraire les 8 derniers chiffres de saisie depuis la valeur normalisée
  const getDigits = (v: string): string => {
    if (!v) return "";
    const cleaned = v.replace(/\D/g, "");
    if (cleaned.startsWith("22901")) {
      return cleaned.slice(5, 13);
    }
    if (cleaned.startsWith("229")) {
      const after229 = cleaned.slice(3);
      if (after229.startsWith("01")) {
        return after229.slice(2, 10);
      }
      return after229.slice(0, 8);
    }
    if (cleaned.startsWith("01")) {
      return cleaned.slice(2, 10);
    }
    return cleaned.slice(0, 8);
  };

  const [localDigits, setLocalDigits] = useState<string>(getDigits(value));
  const [touched, setTouched] = useState(false);

  // Utiliser la valeur externe si elle est disponible
  const digits = value !== "" ? getDigits(value) : localDigits;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
      setLocalDigits(raw);
      const normalized = raw.length > 0 ? "+22901" + raw : "";
      const valid =
        raw.length === 8
          ? isValidPhoneNumber(normalized, "BJ")
          : false;
      onChange(normalized, valid);
    },
    [onChange]
  );

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && digits.length > 0 && digits.length < 8;
  const showInvalid =
    touched &&
    digits.length === 8 &&
    !isValidPhoneNumber("+22901" + digits, "BJ");

  const borderClass =
    showError || showInvalid
      ? "border-danger-500 focus-within:ring-danger-500 focus-within:border-danger-500"
      : "border-neutral-300 focus-within:border-primary-500 focus-within:ring-primary-500";

  return (
    <div className={`space-y-1 ${className}`}>
      <div
        className={`flex h-10 w-full items-center overflow-hidden rounded-md border bg-white transition-all focus-within:outline-none focus-within:ring-2 ${borderClass}`}
      >
        {/* Préfixe fixe : Drapeau 🇧🇯 +229 (01) */}
        <span className="flex h-full select-none items-center gap-1.5 border-r border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-600 shrink-0">
          🇧🇯 <span className="text-neutral-500">+229</span>
          <span className="rounded bg-neutral-200/70 px-1 py-0.5 text-xs font-semibold text-neutral-800">
            (01)
          </span>
        </span>

        {/* Saisie des 8 chiffres restants */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          value={digits}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="97 00 00 00"
          aria-label="Numéro de téléphone Bénin (8 chiffres après +229 (01))"
          aria-invalid={showError || showInvalid}
          className={`h-full flex-1 min-w-0 bg-transparent px-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none disabled:cursor-not-allowed disabled:text-neutral-500 ${inputClassName}`}
        />
      </div>

      {showError && (
        <p className="text-xs text-danger-600">
          Numéro incomplet — 8 chiffres requis après +229 (01)
        </p>
      )}
      {showInvalid && (
        <p className="text-xs text-danger-600">
          Numéro invalide pour le Bénin (+229 01...)
        </p>
      )}
    </div>
  );
}

