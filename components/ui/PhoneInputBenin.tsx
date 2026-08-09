"use client";

import { useState, useCallback } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";

interface PhoneInputBeninProps {
  /** Valeur normalisée stockée : "+229XXXXXXXX" ou chaîne vide */
  value: string;
  /** Appelé à chaque frappe — normalized = "+229XXXXXXXX", isValid = résultat libphonenumber */
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
 * - Préfixe fixe non éditable : 🇧🇯 +229
 * - Saisie des 8 chiffres restants (format ARCEP Bénin : 01XXXXXXX)
 * - Validation via libphonenumber-js
 * - Stockage normalisé : +229XXXXXXXX
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
  // Extraire les 8 chiffres de saisie depuis la valeur normalisée
  const getDigits = (v: string): string => {
    if (v.startsWith("+229")) return v.slice(4);
    return v.replace(/\D/g, "").slice(0, 8);
  };

  const [localDigits, setLocalDigits] = useState<string>(getDigits(value));
  const [touched, setTouched] = useState(false);

  // Utiliser la valeur externe si elle est fournie, sinon l'état local
  const digits = value !== "" && value.startsWith("+229")
    ? getDigits(value)
    : localDigits;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
      setLocalDigits(raw);
      const normalized = raw.length > 0 ? "+229" + raw : "";
      const valid =
        normalized.length === 13
          ? isValidPhoneNumber(normalized, "BJ")
          : false;
      onChange(normalized, valid);
    },
    [onChange]
  );

  const handleFocus = () => {
    if (digits === "" && !disabled) {
      const raw = "01";
      setLocalDigits(raw);
      onChange("+229" + raw, false);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && digits.length > 0 && digits.length < 8;
  const showInvalid =
    touched &&
    digits.length === 8 &&
    !isValidPhoneNumber("+229" + digits, "BJ");

  const borderClass =
    showError || showInvalid
      ? "border-danger-500 focus-within:ring-danger-500 focus-within:border-danger-500"
      : "border-neutral-300 focus-within:border-primary-500 focus-within:ring-primary-500";

  return (
    <div className={`space-y-1 ${className}`}>
      <div
        className={`flex h-10 w-full items-center overflow-hidden rounded-md border bg-white transition-all focus-within:outline-none focus-within:ring-2 ${borderClass}`}
      >
        {/* Préfixe fixe */}
        <span className="flex h-full select-none items-center gap-1 border-r border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-600 shrink-0">
          🇧🇯 <span className="text-neutral-500">+229</span>
        </span>

        {/* Saisie des 8 chiffres */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          value={digits}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="01 XX XX XX"
          aria-label="Numéro de téléphone Bénin (8 chiffres après +229)"
          aria-invalid={showError || showInvalid}
          className={`h-full flex-1 min-w-0 bg-transparent px-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none disabled:cursor-not-allowed disabled:text-neutral-500 ${inputClassName}`}
        />
      </div>

      {showError && (
        <p className="text-xs text-danger-600">
          Numéro incomplet — 8 chiffres requis après +229
        </p>
      )}
      {showInvalid && (
        <p className="text-xs text-danger-600">
          Numéro invalide pour le Bénin (+229)
        </p>
      )}
    </div>
  );
}
