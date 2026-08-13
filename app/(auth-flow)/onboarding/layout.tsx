import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Vérifier que l'utilisateur est connecté
  const user = await getSession();
  if (!user) {
    redirect("/auth");
  }

  // Vérifier que l'onboarding n'est pas déjà complété
  const supabase = await createClient();
  const { data: proprietaire } = await supabase
    .from("proprietaire")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  // Si onboarding est déjà complété, rediriger vers le dashboard
  if (proprietaire?.onboarding_complete) {
    redirect("/home");
  }

  return <>{children}</>;
}
