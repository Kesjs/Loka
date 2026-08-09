import { HandWaving } from "@phosphor-icons/react";

interface StepWelcomeProps {
  onNext: () => void;
}

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNext();
    }
  };

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
      <button
        onClick={onNext}
        onKeyDown={handleKeyDown}
        className="w-full h-10 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors cursor-pointer"
      >
        Commencer
      </button>
    </div>
  );
}
