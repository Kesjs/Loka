"use client";

import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, WarningCircle, Info, X } from "@phosphor-icons/react";

const variantIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: WarningCircle,
  info: Info,
};

const variantIconColors = {
  success: "text-emerald-500",
  error: "text-danger-500",
  warning: "text-amber-500",
  info: "text-neutral-500",
};

export function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = variantIcons[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } }}
              className="pointer-events-auto bg-white border border-neutral-200 rounded-2xl pl-4 pr-3 py-3 flex items-center gap-3 shadow-xl shadow-black/5 min-w-[220px] max-w-[92vw] lg:max-w-sm"
            >
              <Icon size={20} weight="fill" className={`shrink-0 ${variantIconColors[toast.variant]}`} />
              <p className="text-sm font-light text-neutral-800 leading-tight flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors shrink-0 p-1 rounded-full hover:bg-neutral-100"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
