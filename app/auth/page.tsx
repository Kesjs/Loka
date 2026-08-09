import { redirect } from "next/navigation";

export default async function AuthPage() {
  // Redirection vers la page d'accueil (système auth unique)
  redirect("/");
}
