import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface StepCompleteProps {
  onFinish: () => void;
  loading?: boolean;
  error?: string;
}

export default function StepComplete({ onFinish, loading, error }: StepCompleteProps) {
  return (
    <div className="space-y-6 text-center">
      <CheckCircle size={48} weight="duotone" className="mx-auto text-success-600" />

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-danger-50 px-3 py-2.5 text-left text-sm text-danger-600">
          <WarningCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button onClick={onFinish} className="w-full" disabled={loading}>
        {loading ? "Préparation..." : "Accéder au tableau de bord →"}
      </Button>
    </div>
  );
}
