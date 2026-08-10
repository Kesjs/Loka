import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  variant?: "on-dark" | "on-light";
  size?: "sm" | "md";
  showWordmark?: boolean;
  className?: string;
}

const LOGO_SIZES = {
  sm: { box: 36, image: 32 },
  md: { box: 44, image: 40 },
} as const;

/**
 * Affiche le logo avec fond blanc intégré (logo.jpg a un fond blanc).
 * Le conteneur blanc évite la rupture visuelle sur les panneaux sombres.
 */
export default function BrandLockup({
  variant = "on-dark",
  size = "md",
  showWordmark = true,
  className,
}: BrandLockupProps) {
  const dims = LOGO_SIZES[size];
  const onDark = variant === "on-dark";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5",
          onDark ? "shadow-lg ring-1 ring-white/10" : "shadow-md ring-1 ring-neutral-200"
        )}
        style={{ width: dims.box, height: dims.box }}
      >
        <Image
          src="/logo.jpg"
          alt="Loka"
          width={dims.image}
          height={dims.image}
          className="rounded-md object-contain"
          priority
        />
      </div>

      {showWordmark && (
        <span
          className={cn(
            "text-base font-extrabold tracking-[-0.03em]",
            onDark ? "text-white" : "text-neutral-900"
          )}
        >
          Loka
        </span>
      )}
    </div>
  );
}
