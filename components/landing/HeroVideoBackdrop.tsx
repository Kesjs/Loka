"use client";

import { useEffect, useRef } from "react";

/**
 * Fond vidéo professionnel pour le hero
 * Vidéo en boucle avec overlay sombre pour garantir la lisibilité du texte
 */
export default function HeroVideoBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      console.log("[HeroVideoBackdrop] Élément vidéo trouvé");
      video.addEventListener('canplay', () => console.log("[HeroVideoBackdrop] Vidéo prête à jouer"));
      video.addEventListener('error', (e) => console.error("[HeroVideoBackdrop] Erreur vidéo:", e));
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[620px] w-full overflow-hidden bg-blue-500/20"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

      {/* Subtle color overlay for brand consistency */}
      <div className="absolute inset-0 bg-primary-900/10 mix-blend-multiply" />
    </div>
  );
}
