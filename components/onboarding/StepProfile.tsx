import { User, Phone, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import PhoneInputBenin from "@/components/ui/PhoneInputBenin";
import { isValidPhoneNumber } from "libphonenumber-js";

interface StepProfileProps {
  value: { nom: string; telephone: string; email: string };
  onChange: (v: { nom: string; telephone: string; email: string }) => void;
  onNext: () => void;
}

export default function StepProfile({ value, onChange, onNext }: StepProfileProps) {
  const isPhoneValid = value.telephone ? isValidPhoneNumber(value.telephone, "BJ") : false;
  const isValid = value.nom.trim() !== "" && value.telephone.trim() !== "" && isPhoneValid;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
            <User size={15} />
            Nom
            <span className="text-danger-600">*</span>
          </label>
          <input
            type="text"
            value={value.nom}
            onChange={(e) => onChange({ ...value, nom: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder="Ex : Marie Dossou"
            className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
            <Phone size={15} />
            Téléphone
            <span className="text-danger-600">*</span>
          </label>
          <PhoneInputBenin
            value={value.telephone}
            onChange={(normalized) => {
              onChange({ ...value, telephone: normalized });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                e.preventDefault();
                onNext();
              }
            }}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
            <EnvelopeSimple size={15} />
            Email
          </label>
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder="marie@exemple.com"
            className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        <span className="text-danger-600">*</span> Champs obligatoires
      </p>

      <Button onClick={onNext} disabled={!isValid} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
