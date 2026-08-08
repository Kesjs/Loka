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
      {!isValid && (
        <p className="text-sm text-neutral-500">
          Le nom et le téléphone sont requis pour continuer.
        </p>
      )}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Parlez-nous de vous
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Ces informations apparaîtront sur vos quittances.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            <User size={15} /> Nom
          </label>
          <input
            type="text"
            value={value.nom}
            onChange={(e) => onChange({ ...value, nom: e.target.value })}
            placeholder="Ex : Marie Dossou"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            <Phone size={15} /> Téléphone
          </label>
          <input
            type="tel"
            value={value.telephone}
            onChange={(e) => onChange({ ...value, telephone: e.target.value })}
            placeholder="Ex : 97 00 00 00"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            <EnvelopeSimple size={15} /> Email
          </label>
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder="Ex : marie@exemple.com"
            className="w-full h-10 px-3 rounded-md border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
