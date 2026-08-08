import { redirect } from "next/navigation";

export default function RootPage() {
  // Le middleware garantit qu'on arrive ici uniquement authentifié
  // et avec l'onboarding terminé (sinon redirigé avant).
  redirect("/home");
}
