"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu du compte"
        aria-expanded={open}
        className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold hover:bg-primary-200 transition-colors"
      >
        P
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-1 z-50"
          >
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-50"
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
