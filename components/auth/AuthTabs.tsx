"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/forms/SignInForm";
import SignUpForm from "@/components/auth/forms/SignUpForm";
import ForgotPasswordForm from "@/components/auth/forms/ForgotPasswordForm";
import { AUTH_MESSAGES } from "@/lib/auth-messages";

type AuthTab = "signin" | "signup" | "forgot-password";

function getInitialTab(param: string | null): AuthTab {
  return param === "signup" ? "signup" : "signin";
}

export default function AuthTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AuthTab>(() => getInitialTab(searchParams.get("tab")));

  // Garde l'URL synchronisée (/auth ou /auth?tab=signup) quand on change d'onglet
  function setTab(tab: AuthTab) {
    setActiveTab(tab);
    if (tab === "signup") {
      router.replace("/auth?tab=signup", { scroll: false });
    } else if (tab === "signin") {
      router.replace("/auth", { scroll: false });
    }
  }

  // Récupérer le contenu dynamique selon la tab active
  const contentKeyMap = {
    signin: "signIn",
    signup: "signUp",
    "forgot-password": "forgotPassword",
  } as const;
  const contentKey = contentKeyMap[activeTab];
  const leftContent = AUTH_MESSAGES.leftContent[contentKey];

  // Variant d'animation pour les onglets
  const tabVariants = {
    enter: { opacity: 0, x: 12 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
  };

  return (
    <AuthShell
      leftTitle={leftContent.title}
      leftSubtitle={leftContent.subtitle}
      showTabs
      activeTab={activeTab}
      onTabChange={setTab}
      media={{ type: "video", src: "/auth/login.mp4", poster: "/auth/login-poster.jpg" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {activeTab === "signin" && (
            <SignInForm onForgotPassword={() => setActiveTab("forgot-password")} />
          )}
          {activeTab === "signup" && (
            <SignUpForm onSwitchToSignIn={() => setTab("signin")} />
          )}
          {activeTab === "forgot-password" && (
            <ForgotPasswordForm onBackToSignIn={() => setActiveTab("signin")} />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}
