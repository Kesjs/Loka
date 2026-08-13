import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Buildings, User } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import TenantSignOutButton from "@/components/tenant/TenantSignOutButton";

/**
 * Layout du Portail Locataire (/tenant/dashboard et routes futures).
 * Protège l'accès : un visiteur non connecté, ou connecté mais sans fiche
 * locataire liée (auth_user_id), est renvoyé vers /tenant/login.
 * /tenant/login est hors de ce groupe : il n'affiche pas ce header.
 */
export default async function TenantLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tenant/login");
  }

  const { data: locataire } = await supabase
    .from("locataires")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!locataire) {
    redirect("/tenant/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/tenant/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <Buildings size={20} weight="duotone" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-black text-white">Lokka</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Espace Locataire
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-300">
              <User size={15} className="text-emerald-400" />
              <span>Mon Espace</span>
            </div>
            <TenantSignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
