"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Chargement différé + sans SSR : évite tout coût sur le rendu serveur et
// sur mobile, où la scène ne s'affiche de toute façon pas (voir ci-dessous).
const HeroBuildingsScene = dynamic(() => import("./HeroBuildingsScene"), {
  ssr: false,
});

/**
 * Positionne la scène 3D en arrière-plan discret du hero, derrière le texte
 * (aria-hidden, pointer-events désactivés). N'est montée qu'à partir du
 * breakpoint desktop pour préserver la performance et le LCP sur mobile —
 * en dessous, le halo existant (gradient flouté) suffit visuellement.
 */
export default function HeroBuildingsBackdrop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(query.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-[5] h-[620px] opacity-[0.55] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_78%,transparent)]"
    >
      <HeroBuildingsScene />
    </div>
  );
}
