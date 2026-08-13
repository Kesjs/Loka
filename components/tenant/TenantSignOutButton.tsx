"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export default function TenantSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/tenant/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
      title="Déconnexion"
    >
      <SignOut size={16} />
      <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
