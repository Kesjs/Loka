import { Suspense } from "react";
import AuthTabs from "@/components/auth/AuthTabs";

export const metadata = {
  title: "Connexion ou création de compte — Loka",
};

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthTabs />
    </Suspense>
  );
}
