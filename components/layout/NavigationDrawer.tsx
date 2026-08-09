"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { flatNavItems } from "./nav-items";
import { useOrganisationType } from "@/lib/hooks/useOrganisationType";

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function NavigationDrawer({
  open,
  onClose,
}: NavigationDrawerProps) {
  const pathname = usePathname();
  const orgType = useOrganisationType();

  // Filtrer les items selon le type d'organisation
  const visibleNavItems = flatNavItems.filter((item) => {
    if (!item.conditionalShow) return true;
    
    // Si l'item doit être visible pour gestionnaire, le montrer aussi pour agence
    if (item.conditionalShow === "gestionnaire") {
      return orgType === "gestionnaire" || orgType === "agence";
    }
    
    return item.conditionalShow === orgType;
  });

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-0 top-0 bottom-0 z-50 lg:hidden w-72 bg-gradient-to-b from-slate-50 to-slate-100 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between h-16 px-4 border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-10 w-10 shrink-0 rounded-md shadow-lg overflow-hidden flex-shrink-0">
                  <Image 
                    src="/logo.jpg" 
                    alt="Logo Saint Pierre Immobilier" 
                    fill 
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="leading-tight">
                  <span className="block text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    Saint Pierre
                  </span>
                  <span className="block text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                    Immobilier
                  </span>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Fermer le menu"
                className="text-slate-400 hover:text-primary-600 transition-colors p-2 rounded-md hover:bg-slate-200 flex-shrink-0"
              >
                <X size={20} weight="bold" />
              </motion.button>
            </motion.div>

            {/* Navigation Items */}
            <nav className="px-3 py-6 space-y-0">
              {visibleNavItems.map(({ href, label, icon: Icon, divider }, index) => {
                const isActive = pathname?.startsWith(href);
                return (
                  <div key={href}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                    >
                      <Link
                        href={href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive
                            ? "bg-gradient-to-r from-primary-500/20 to-primary-500/10 text-primary-700 shadow-md shadow-primary-500/10"
                            : "text-slate-600 hover:bg-slate-200 hover:text-slate-900 active:scale-95"
                        }`}
                      >
                        <motion.div
                          animate={{ scale: isActive ? 1.2 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            size={18}
                            weight={isActive ? "fill" : "regular"}
                            className="shrink-0"
                          />
                        </motion.div>
                        <span className="truncate">{label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-3 h-2 w-2 bg-primary-600 rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>

                    {/* Divider */}
                    {divider && (
                      <div className="my-1 h-px bg-gradient-to-r from-slate-300 via-slate-200 to-transparent" />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Safe area bottom */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
