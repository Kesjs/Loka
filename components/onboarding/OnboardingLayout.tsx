"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, House, User, UsersThree, ChartBar, Buildings, Door, CheckCircle } from "@phosphor-icons/react";
import Image from "next/image";
import ProgressDots from "./ProgressDots";

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onPrev?: () => void;
  illustration?: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  iconName?: "house" | "user" | "users" | "chart" | "buildings" | "door" | "check";
}

// Map icon names to Phosphor icon components
const getIconComponent = (iconName?: string) => {
  const iconProps = { size: 24, weight: "duotone" as const, className: "text-indigo-600" };
  switch (iconName) {
    case "house":
      return <House {...iconProps} />;
    case "user":
      return <User {...iconProps} />;
    case "users":
      return <UsersThree {...iconProps} />;
    case "chart":
      return <ChartBar {...iconProps} />;
    case "buildings":
      return <Buildings {...iconProps} />;
    case "door":
      return <Door {...iconProps} />;
    case "check":
      return <CheckCircle {...iconProps} />;
    default:
      return null;
  }
};

export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  onPrev,
  illustration,
  title,
  subtitle,
  icon,
  iconName,
}: OnboardingLayoutProps) {
  const showProgress = step > 0 && step < totalSteps - 1;
  const showBackButton = step > 0;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  
  // Use provided icon or generate from iconName
  const displayIcon = icon || getIconComponent(iconName);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Branding & Illustrations (Hidden on mobile, visible on desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100 flex-col items-center justify-center p-8 lg:p-12">
        <motion.div
          className="text-center space-y-8 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Image
              src="/logo.jpg"
              alt="Saint Pierre Immobilier"
              width={56}
              height={56}
              className="mx-auto"
            />
          </motion.div>

          {/* Illustration */}
          {illustration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-64 flex items-center justify-center"
            >
              {illustration}
            </motion.div>
          )}

          {/* Branding Content */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
              Gérez votre immobilier simplement.
            </h1>
            <p className="text-neutral-600 leading-relaxed">
              Une seule plateforme pour vos biens, logements, locataires et
              paiements.
            </p>
          </motion.div>

          {/* Context Title & Subtitle (for steps after Welcome) */}
          {step > 0 && title && (
            <motion.div
              className="space-y-2 pt-4 border-t border-neutral-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-3">
                {displayIcon && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="flex-shrink-0"
                  >
                    {displayIcon}
                  </motion.div>
                )}
                <h2 className="text-lg font-semibold text-neutral-900">
                  {title}
                </h2>
              </div>
              {subtitle && (
                <p className="text-sm text-neutral-500">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Side: Onboarding Forms */}
      <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center px-4 py-8 md:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo (shown only on mobile) */}
          <div className="md:hidden text-center mb-6">
            <Image
              src="/logo.jpg"
              alt="Saint Pierre Immobilier"
              width={40}
              height={40}
              className="mx-auto"
            />
          </div>

          {/* Back Button */}
          {showBackButton && onPrev && (
            <motion.button
              type="button"
              onClick={onPrev}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800 cursor-pointer"
            >
              <ArrowLeft size={14} /> Retour
            </motion.button>
          )}

          {/* Progress Dots */}
          {showProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-6"
            >
              <ProgressDots current={step} total={totalSteps} />
            </motion.div>
          )}

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white md:bg-neutral-50/50 rounded-lg md:rounded-xl p-6 md:p-8"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
