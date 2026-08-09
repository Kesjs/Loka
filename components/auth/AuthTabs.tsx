"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/forms/SignInForm";
import SignUpForm from "@/components/auth/forms/SignUpForm";
import ForgotPasswordForm from "@/components/auth/forms/ForgotPasswordForm";
import { AUTH_MESSAGES } from "@/lib/auth-messages";

type AuthTab = "signin" | "signup" | "forgot-password";

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");

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
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AuthShell
      leftTitle={leftContent.title}
      leftSubtitle={leftContent.subtitle}
      rightTitle="Loka"
      rightSubtitle="Gestion Locative Simplifiée"
      showTabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          {activeTab === "signin" && (
            <SignInForm onForgotPassword={() => setActiveTab("forgot-password")} />
          )}
          {activeTab === "signup" && (
            <SignUpForm onSwitchToSignIn={() => setActiveTab("signin")} />
          )}
          {activeTab === "forgot-password" && (
            <ForgotPasswordForm onBackToSignIn={() => setActiveTab("signin")} />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}
