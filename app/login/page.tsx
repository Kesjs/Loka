import AuthTabs from "@/components/auth/AuthTabs";

export const metadata = {
  title: "Connexion — Loka",
  description: "Accédez à votre espace de gestion locative Loka.",
};

export default function LoginPage() {
  return <AuthTabs />;
}
