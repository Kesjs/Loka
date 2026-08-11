import * as React from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  icon?: Icon;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Enveloppe standard pour un champ de formulaire : label + icône Phosphor,
 * astérisque si requis, et message d'erreur inline sous le champ.
 * Utiliser autour d'un <input>/<select> déjà stylé.
 */
export function FormField({ label, icon: IconComponent, required, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {IconComponent && <IconComponent size={15} className="text-neutral-400" />}
        {label}
        {required && <span className="text-danger-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium text-danger-600">{error}</p>
      )}
    </div>
  );
}

export const fieldInputClass =
  "w-full rounded-2xl bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition";

export const fieldInputErrorClass =
  "w-full rounded-2xl bg-danger-50/30 px-4 py-3 text-sm text-neutral-900 outline-none transition";
