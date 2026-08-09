import { HandWaving } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  onNext: () => void;
}

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-6 text-center">
      <HandWaving size={40} weight="duotone" className="mx-auto text-accent-500" />
      <Button onClick={onNext} className="w-full">
        Commencer la configuration
      </Button>
    </div>
  );
}
