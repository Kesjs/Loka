import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAuth();

  // Vérifier si l'onboarding est complété
  const supabase = await createClient();
  const { data: proprietaire } = await supabase
    .from("proprietaire")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  // Si onboarding pas complété, rediriger
  if (!proprietaire?.onboarding_complete) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
