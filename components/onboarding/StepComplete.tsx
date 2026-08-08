import { Confetti, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface StepCompleteProps {
  onFinish: () => void;
  loading?: boolean;
  error?: string;
}

export default function StepComplete({ onFinish, loading, error }: StepCompleteProps) {
  return (
    <div className="text-center space-y-6">
      <Confetti size={40} weight="duotone" className="mx-auto text-accent-500" />
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900">
          Félicitations
        </h2>
        <p className="text-sm text-neutral-500">
          Votre espace est prêt. Vous pouvez tout modifier à tout moment
          depuis les paramètres.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-danger-600 bg-danger-50 rounded-md px-3 py-2.5 text-left">
          <WarningCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button onClick={onFinish} className="w-full" disabled={loading}>
        {loading ? "Préparation..." : "Accéder à mon tableau de bord"}
      </Button>
    </div>
  );
}
