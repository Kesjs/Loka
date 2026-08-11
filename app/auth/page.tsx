import { Suspense } from "react";
import AuthTabsMinimal from "@/components/auth/AuthTabsMinimal";

export const metadata = {
  title: "Connexion ou création de compte — Loka",
};

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthTabsMinimal />
    </Suspense>
  );
}
