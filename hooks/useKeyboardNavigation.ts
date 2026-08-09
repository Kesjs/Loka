import { useEffect, useCallback } from "react";

/**
 * Hook pour ajouter le support du clavier à la navigation du onboarding
 * Entrée ou Espace pour soumettre les formulaires
 */
export function useKeyboardNavigation(onSubmit: () => void) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignorer si on est dans un textarea ou contenteditable
      const target = e.target as HTMLElement;
      if (target?.tagName === "TEXTAREA" || target?.contentEditable === "true") {
        return;
      }

      // Entrée ou Espace pour soumettre
      if (e.key === "Enter" || e.key === " ") {
        const activeElement = document.activeElement as HTMLElement;
        
        // Si c'est un input/select, laisse le comportement normal sauf Entrée
        if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "SELECT") {
          if (e.key === "Enter") {
            // Pour Select, on laisse faire
            if (activeElement?.tagName !== "SELECT") {
              e.preventDefault();
              onSubmit();
            }
          }
          return;
        }

        // Si rien n'est focalisé spécifiquement, on accepte Entrée/Espace
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
