import { HandWaving } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  onNext: () => void;
}

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="text-center space-y-6">
      <HandWaving size={40} weight="duotone" className="mx-auto text-accent-500" />
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900">
          Bonjour, bienvenue chez Saint Pierre Immobilier
        </h2>
        <p className="text-sm text-neutral-500">
          Configurons votre espace ensemble, ça prend 5 minutes.
        </p>
      </div>
      <Button onClick={onNext} className="w-full">
        Commencer
      </Button>
    </div>
  );
}
