import { User, Phone, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface StepProfileProps {
  value: { nom: string; telephone: string; email: string };
  onChange: (v: { nom: string; telephone: string; email: string }) => void;
  onNext: () => void;
}

export default function StepProfile({ value, onChange, onNext }: StepProfileProps) {
  const isValid = value.nom.trim() !== "" && value.telephone.trim() !== "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Parlez-nous de vous
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Ces informations apparaîtront sur vos quittances.
        </p>
      </div>

      <div className="space-y-3">
        {/* Nom */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
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
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
            <Phone size={15} /> 
            Téléphone
            <span className="text-danger-600">*</span>
          </label>
          <input
            type="tel"
            value={value.telephone}
            onChange={(e) => onChange({ ...value, telephone: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder="+229 97 00 00 00"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
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
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Légende des champs obligatoires */}
      <p className="text-xs text-neutral-500">
        <span className="text-danger-600">*</span> Champs obligatoires
      </p>

      <Button onClick={onNext} disabled={!isValid} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
