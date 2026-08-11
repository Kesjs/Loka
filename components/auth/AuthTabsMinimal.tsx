"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthShellMinimal from "@/components/auth/AuthShellMinimal";
import SignInFormMinimal from "@/components/auth/forms/SignInFormMinimal";
import SignUpFormMinimal from "@/components/auth/forms/SignUpFormMinimal";
import ForgotPasswordFormMinimal from "@/components/auth/forms/ForgotPasswordFormMinimal";
import { AUTH_MESSAGES } from "@/lib/auth-messages";

type AuthTab = "signin" | "signup" | "forgot-password";

function getInitialTab(param: string | null): AuthTab {
  return param === "signup" ? "signup" : "signin";
}

export default function AuthTabsMinimal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AuthTab>(() => getInitialTab(searchParams.get("tab")));

  function setTab(tab: AuthTab) {
    setActiveTab(tab);
    if (tab === "signup") {
      router.replace("/auth?tab=signup", { scroll: false });
    } else if (tab === "signin") {
      router.replace("/auth", { scroll: false });
    }
  }

  const contentKeyMap = {
    signin: "signIn",
    signup: "signUp",
    "forgot-password": "forgotPassword",
  } as const;
  const contentKey = contentKeyMap[activeTab];
  const leftContent = AUTH_MESSAGES.leftContent[contentKey];

  const tabVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AuthShellMinimal
      leftTitle={leftContent.title}
      leftSubtitle={leftContent.subtitle}
      media={{ type: "video", src: "/auth/login.mp4", poster: "/auth/login-poster.jpg" }}
      footer={
        <div className="text-center text-sm text-neutral-500">
          {activeTab === "signin" ? (
            <>
              {AUTH_MESSAGES.hints.haveAccount}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="ml-1 font-medium text-neutral-900 hover:text-neutral-700 transition-colors underline decoration-neutral-300 underline-offset-4"
              >
                {AUTH_MESSAGES.hints.switchToSignUp}
              </button>
            </>
          ) : (
            <>
              {AUTH_MESSAGES.hints.haveAccount}
              <button
                type="button"
                onClick={() => setTab("signin")}
                className="ml-1 font-medium text-neutral-900 hover:text-neutral-700 transition-colors underline decoration-neutral-300 underline-offset-4"
              >
                {AUTH_MESSAGES.hints.switchToSignIn}
              </button>
            </>
          )}
        </div>
      }
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
            <SignInFormMinimal onForgotPassword={() => setActiveTab("forgot-password")} />
          )}
          {activeTab === "signup" && (
            <SignUpFormMinimal onSwitchToSignIn={() => setTab("signin")} />
          )}
          {activeTab === "forgot-password" && (
            <ForgotPasswordFormMinimal onBackToSignIn={() => setActiveTab("signin")} />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShellMinimal>
  );
}
