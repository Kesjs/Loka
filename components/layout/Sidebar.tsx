"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretLeft, CaretRight, Buildings } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { getNavItemsByProfile } from "./nav-items";
import { useOrganisationInfo } from "@/lib/hooks/useOrganisationType";

interface SidebarProps {
  open: boolean;
  onToggleOpen: () => void;
}

export default function Sidebar({ open, onToggleOpen }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = !open;
  const { organisationType, organisationNom, logoUrl } = useOrganisationInfo();

  // Récupérer les items selon le profil de l'utilisateur
  const visibleNavItems = getNavItemsByProfile(organisationType);

  // Animation variants
  const sidebarVariants = {
    open: {
      width: 256,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: 72,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <motion.aside
      initial={false}
      animate={collapsed ? "collapsed" : "open"}
      variants={sidebarVariants}
      className={`fixed hidden lg:flex flex-col shrink-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 shadow-xl z-30`}
    >
      {/* Header with logo + toggle */}
      <div
        className={`flex items-center h-16 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm ${
          collapsed ? "justify-center" : "justify-between pl-3 pr-2"
        }`}
      >
        {collapsed ? (
          /* Collapsed: Just logo, centered */
          <Link
            href="/home"
            className="flex items-center justify-center"
            title={organisationNom}
          >
            <div className="relative h-10 w-10 rounded-md shadow-lg overflow-hidden flex items-center justify-center bg-slate-800 border border-slate-700 text-primary-400">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={organisationNom}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <Buildings size={22} weight="duotone" />
              )}
            </div>
          </Link>
        ) : (
          /* Open: Logo + text */
          <>
            <Link
              href="/home"
              className="flex items-center gap-3 min-w-0"
            >
              <div className="relative h-10 w-10 shrink-0 rounded-md shadow-lg overflow-hidden flex items-center justify-center bg-slate-800 border border-slate-700 text-primary-400">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={organisationNom}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Buildings size={22} weight="duotone" />
                )}
              </div>
              <div className="leading-tight whitespace-nowrap overflow-hidden">
                <span className="block text-sm font-bold text-primary-400 truncate max-w-[140px]">
                  {organisationNom}
                </span>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {organisationType === "agence" ? "Agence" : organisationType === "gestionnaire" ? "Gestionnaire" : "Gestion Locative"}
                </span>
              </div>
            </Link>

            <motion.button
              onClick={onToggleOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-primary-400 flex-shrink-0"
              aria-label="Fermer la barre latérale"
            >
              <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
                <CaretLeft size={16} weight="bold" />
              </motion.div>
            </motion.button>
          </>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {visibleNavItems.map(({ href, label, icon: Icon, divider }, index) => {
          const isActive = pathname?.startsWith(href);
          return (
            <div key={href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`group relative flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500/20 to-primary-500/10 text-slate-100 shadow-lg shadow-primary-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  } ${
                    collapsed
                      ? "justify-center px-2 py-2.5 w-full"
                      : "px-3 py-2.5"
                  }`}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                    className={`shrink-0 ${isActive ? "text-primary-400" : "text-slate-400"}`}
                  >
                    <Icon
                      size={18}
                      weight={isActive ? "fill" : "regular"}
                    />
                  </motion.div>
                  {!collapsed && (
                    <motion.span
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}

                  {/* Tooltip on collapse */}
                  {collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs text-slate-100 shadow-lg z-10 border border-slate-700"
                    >
                      {label}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Divider */}
              {divider && !collapsed && (
                <div className="my-1 h-px bg-gradient-to-r from-slate-700 via-slate-600 to-transparent" />
              )}
            </div>
          );
        })}
      </nav>

      {/* Bouton pour ré-ouvrir quand collapsed */}
      {collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 pb-4"
        >
          <motion.button
            onClick={onToggleOpen}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-full items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-primary-400"
            aria-label="Ouvrir la barre latérale"
          >
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <CaretRight size={16} weight="bold" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </motion.aside>
  );
}
