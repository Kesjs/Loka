"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SignOut, Airplane } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [estADistance, setEstADistance] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profil } = await supabase
        .from("proprietaire")
        .select("nom, est_a_distance")
        .eq("id", user.id)
        .maybeSingle();

      setUserName(profil?.nom || user.email?.split("@")[0] || null);
      setEstADistance(!!profil?.est_a_distance);
    })();
  }, []);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  const initials = getInitials(userName || "");

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      {estADistance && (
        <span
          title="Gestion à distance"
          className="hidden items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 sm:flex"
        >
          <Airplane size={13} weight="fill" />
          À distance
        </span>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu du compte"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-200"
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-11 z-50 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          >
            {userName && (
              <div className="px-3.5 py-2 text-sm font-medium text-neutral-900 border-b border-neutral-100">
                {userName}
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-50"
            >
              <SignOut size={17} />
              {loading ? "Déconnexion..." : "Déconnexion"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
