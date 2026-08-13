/**
 * PersistentMediaPanel.tsx
 *
 * Colonne droite (vidéo) partagée entre /auth et /onboarding via le layout
 * commun app/(auth-flow)/layout.tsx. Visible à partir de md: (desktop et
 * tablette) ; masquée sur mobile pour laisser le formulaire en plein écran.
 * Ne scroll jamais, ne se démonte jamais en changeant de route à
 * l'intérieur du groupe (grâce au layout Next.js partagé, la vidéo ne
 * recharge pas — seule sa visibilité CSS change avec la taille d'écran).
 */
export default function PersistentMediaPanel() {
  return (
    <div className="relative hidden h-full shrink-0 overflow-hidden bg-neutral-50 md:block md:w-[45%] lg:w-[58%]">
      <video
        src="/auth/login.mp4"
        poster="/auth/login-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
}
