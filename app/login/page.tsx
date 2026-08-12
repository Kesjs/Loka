import AuthTabs from "@/components/auth/AuthTabs";

export const metadata = {
  title: "Connexion — Lokka",
  description: "Accédez à votre espace de gestion locative Lokka.",
};

export default function LoginPage() {
  return <AuthTabs />;
}
