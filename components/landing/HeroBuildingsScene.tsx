"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

/**
 * Scène 3D d'arrière-plan du hero : quelques immeubles low-poly stylisés
 * aux couleurs de la marque (vert forêt + touches terracotta) qui
 * s'assemblent en douceur au chargement, puis flottent très légèrement
 * et suivent la souris (parallax discret).
 *
 * Contraintes volontaires, pour ne pas fatiguer l'œil ni distraire du
 * texte du hero :
 * - amplitude de mouvement faible (rotation/flottement en px, pas de tours)
 * - pas de couleurs saturées ni de reflets métalliques agressifs
 * - respect de prefers-reduced-motion (scène figée, posée)
 * - rendu uniquement à partir de lg: (voir HeroBuildingsBackdrop)
 */

const PALETTE = {
  primary900: "#032f1f",
  primary800: "#04432e",
  primary700: "#05573d",
  primary600: "#066b4c",
  primary500: "#087F5B",
  accent600: "#a6431f",
  accent500: "#c2542d",
  accent300: "#e29f7c",
};

type BuildingSpec = {
  position: [number, number, number];
  size: [number, number, number]; // largeur, hauteur, profondeur
  color: string;
  windowColor: string;
  litWindow?: boolean;
  delay: number; // décalage de l'animation d'assemblage, en secondes
};

const BUILDINGS: BuildingSpec[] = [
  { position: [-2.6, 0, -0.6], size: [1.05, 2.1, 1.05], color: PALETTE.primary700, windowColor: PALETTE.primary900, delay: 0.05 },
  { position: [-1.15, 0, 0.4], size: [1.3, 3.1, 1.3], color: PALETTE.primary800, windowColor: PALETTE.primary900, litWindow: true, delay: 0.2 },
  { position: [0.45, 0, -0.2], size: [1.15, 2.5, 1.15], color: PALETTE.primary600, windowColor: PALETTE.primary900, delay: 0.35 },
  { position: [1.9, 0, 0.3], size: [1.35, 3.6, 1.35], color: PALETTE.primary700, windowColor: PALETTE.primary900, litWindow: true, delay: 0.15 },
  { position: [3.15, 0, -0.5], size: [0.95, 1.7, 0.95], color: PALETTE.accent600, windowColor: PALETTE.primary900, delay: 0.45 },
];

function windowGrid(width: number, height: number, depth: number, color: string, lit: boolean) {
  const cols = Math.max(1, Math.round(width * 2.2));
  const rows = Math.max(1, Math.round(height * 1.6));
  const windows: { x: number; y: number; z: number; face: "front" | "side"; lit: boolean }[] = [];
  const marginX = width / (cols + 1);
  const marginY = height / (rows + 1.2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -width / 2 + marginX * (c + 1);
      const y = -height / 2 + marginY * (r + 1.2);
      const isLit = lit && Math.random() < 0.16;
      windows.push({ x, y, z: depth / 2 + 0.01, face: "front", lit: isLit });
    }
  }
  return windows;
}

function Building({ spec, index, reduced }: { spec: BuildingSpec; index: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [assembled, setAssembled] = useState(reduced);
  const startY = spec.size[1] / 2;
  const targetY = spec.size[1] / 2;
  const windows = useMemo(
    () => windowGrid(spec.size[0], spec.size[1], spec.size[2], spec.windowColor, !!spec.litWindow),
    [spec]
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!assembled) {
      // Assemblage : montée douce depuis le sol + fondu, décalée par bâtiment.
      const elapsed = state.clock.elapsedTime - spec.delay;
      if (elapsed < 0) {
        group.current.position.y = startY - 2.2;
        group.current.scale.setScalar(0.001);
        return;
      }
      const t = Math.min(1, elapsed / 0.9);
      const eased = 1 - Math.pow(1 - t, 3);
      group.current.position.y = THREE.MathUtils.lerp(startY - 2.2, targetY, eased);
      group.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, eased));
      if (t >= 1) setAssembled(true);
      return;
    }
    // Flottement idle très léger, une fois assemblé.
    const bob = Math.sin(state.clock.elapsedTime * 0.6 + index * 1.3) * 0.03;
    group.current.position.y = targetY + bob;
  });

  return (
    <group ref={group} position={[spec.position[0], startY, spec.position[2]]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={spec.size} />
        <meshStandardMaterial color={spec.color} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Toit légèrement plus foncé pour la lecture "isométrique" */}
      <mesh position={[0, spec.size[1] / 2 + 0.02, 0]}>
        <boxGeometry args={[spec.size[0] * 1.02, 0.04, spec.size[2] * 1.02]} />
        <meshStandardMaterial color={PALETTE.primary900} roughness={0.9} />
      </mesh>
      {windows.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, w.z]}>
          <planeGeometry args={[0.09, 0.13]} />
          <meshStandardMaterial
            color={w.lit ? PALETTE.accent300 : PALETTE.primary900}
            emissive={w.lit ? PALETTE.accent500 : "#000000"}
            emissiveIntensity={w.lit ? 0.55 : 0}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function MouseParallaxRig({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
  const rig = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!rig.current) return;
    if (!reduced) {
      target.current.x = state.pointer.x * 0.18;
      target.current.y = state.pointer.y * 0.08;
    }
    // Amplitude volontairement faible : parallax discret, pas d'effet gadget.
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, target.current.x, 0.04);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, -target.current.y * 0.4, 0.04);
  });

  return <group ref={rig}>{children}</group>;
}

export default function HeroBuildingsScene() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        alpha: true,
        // Sur GPU faible / rendu logiciel, ces deux options évitent que le
        // navigateur refuse ou tue le contexte au lieu de basculer proprement.
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ position: [0, 2.4, 8.5], fov: 32 }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        // Tentative de récupération automatique si le contexte est perdu
        // en cours de route (au lieu de rester sur un canvas figé/vide).
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          console.warn("[HeroBuildingsScene] Contexte WebGL perdu — tentative de restauration…");
        });
        canvas.addEventListener("webglcontextrestored", () => {
          console.info("[HeroBuildingsScene] Contexte WebGL restauré.");
        });
      }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 4]} intensity={0.9} color="#fff7ef" />
      <directionalLight position={[-5, 3, -3]} intensity={0.25} color={PALETTE.primary500} />

      <Suspense fallback={null}>
        <MouseParallaxRig reduced={reduced}>
          <Float
            speed={reduced ? 0 : 0.6}
            rotationIntensity={reduced ? 0 : 0.03}
            floatIntensity={reduced ? 0 : 0.15}
          >
            <group position={[0, -1.3, 0]}>
              {BUILDINGS.map((spec, i) => (
                <Building key={i} spec={spec} index={i} reduced={reduced} />
              ))}
              {/* Sol très discret pour ancrer visuellement les volumes */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[14, 6]} />
                <meshStandardMaterial color={PALETTE.primary900} transparent opacity={0.06} />
              </mesh>
            </group>
          </Float>
        </MouseParallaxRig>
      </Suspense>
    </Canvas>
  );
}
