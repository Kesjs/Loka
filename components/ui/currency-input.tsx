import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: string;
  onChange: (rawDigitsValue: string) => void;
  placeholder?: string;
  className?: string;
  devise?: string;
  id?: string;
}

/**
 * Input numérique avec séparateur de milliers affiché en direct (ex: 120 000).
 * onChange reçoit toujours la valeur numérique brute (sans espaces) pour rester
 * simple à stocker/soumettre.
 */
export function CurrencyInput({ value, onChange, placeholder, className, devise = "FCFA", id }: CurrencyInputProps) {
  const displayValue = value ? Number(value).toLocaleString("fr-FR") : "";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/[^\d]/g, "");
    onChange(digitsOnly);
  }

  return (
    <div className="relative">
      <input
        id={id}
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("pr-16", className)}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
        {devise}
      </span>
    </div>
  );
}
