import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AuthTabs from "@/components/auth/AuthTabs";

export default async function RootPage() {
  // Vérifier si l'utilisateur est déjà connecté
  const user = await getSession();

  // Si connecté, rediriger vers le home/onboarding
  if (user) {
    redirect("/home");
  }

  // Si non connecté, afficher l'auth (système unique)
  return <AuthTabs />;
}
