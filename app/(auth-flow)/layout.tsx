import { ReactNode } from "react";
import PersistentMediaPanel from "@/components/auth/PersistentMediaPanel";

/**
 * Layout partagé entre /auth et /onboarding (route group, n'affecte pas
 * l'URL). La vidéo de droite est montée UNE SEULE FOIS ici : naviguer entre
 * /auth et /onboarding ne la recharge jamais, puisque Next.js ne démonte pas
 * un layout parent en changeant de route à l'intérieur du même groupe.
 *
 * Colonne gauche : seule zone qui scroll (le contenu — formulaire ou étapes
 * d'onboarding — peut dépasser la hauteur d'écran).
 * Colonne droite : vidéo fixe, jamais de scroll.
 *
 * Sur desktop/tablette (md: et plus) : split gauche/droite, comme avant.
 * Sur mobile (< md) : formulaire plein écran, vidéo masquée (voir
 * PersistentMediaPanel.tsx) — la vidéo reste montée une seule fois dans ce
 * layout partagé, donc l'absence de rechargement entre /auth et
 * /onboarding ne change pas, seule sa visibilité CSS change selon l'écran.
 */
export default function AuthFlowLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-white md:flex-row">
      <div className="h-full w-full flex-1 overflow-y-auto">{children}</div>
      <PersistentMediaPanel />
    </div>
  );
}
