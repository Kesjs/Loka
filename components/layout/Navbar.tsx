"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Buildings, FileText, House, List, MagnifyingGlass, Sparkle, Users } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import UserMenu from "@/components/layout/UserMenu";
import { AlertBell } from "@/components/alerts";
import { allNavItems } from "@/components/layout/nav-items";

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function Navbar({ title, onMenuClick, sidebarOpen = true }: NavbarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const quickAction = pathname?.startsWith("/locataires")
    ? { href: "/locataires/new", label: "Nouveau locataire", icon: Users }
    : pathname?.startsWith("/contrats")
      ? { href: "/contrats/new", label: "Nouveau contrat", icon: FileText }
      : pathname?.startsWith("/logements")
        ? { href: "/logements/new", label: "Nouveau logement", icon: House }
        : { href: "/immeubles/new", label: "Nouvel immeuble", icon: Buildings };

  const QuickIcon = quickAction.icon;

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return allNavItems.slice(0, 4);
    }

    return allNavItems
      .filter((item) => item.label.toLowerCase().includes(normalized) || item.href.toLowerCase().includes(normalized))
      .slice(0, 5);
  }, [query]);

  return (
    <nav className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-8">
      {/* LEFT SECTION - Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* Animated Hamburger Button */}
        <motion.button
          onClick={onMenuClick}
          className={`rounded-md p-2 transition-colors ${
            sidebarOpen 
              ? "text-primary-600 hover:bg-primary-50" 
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={sidebarOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : -90 }}
            transition={{ duration: 0.3 }}
          >
            <List size={24} weight={sidebarOpen ? "fill" : "regular"} />
          </motion.div>
        </motion.button>

        {/* Page Title */}
        <div className="hidden sm:block">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Tableau de bord</p>
          <h1 className="text-lg font-semibold text-neutral-900">{title ?? "Vue d'ensemble"}</h1>
        </div>
      </div>

      {/* RIGHT SECTION - Search + Assistant + Quick Action + Alerts + User Menu */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
            aria-label="Ouvrir la recherche"
          >
            <MagnifyingGlass size={18} />
          </button>

          <div
            className={`absolute right-0 top-12 z-40 w-[min(90vw,18rem)] rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:relative md:top-0 md:w-72 md:rounded-full md:border-neutral-200 md:bg-neutral-50 md:p-0 md:shadow-none ${searchOpen ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 md:bg-neutral-50">
              <MagnifyingGlass size={16} className="text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Rechercher"
                className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
              />
            </div>

            {query.trim() && suggestions.length > 0 ? (
              <div className="mt-2 space-y-1 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm md:absolute md:left-0 md:top-12 md:w-full md:rounded-2xl md:p-2">
                {suggestions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl px-2 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-neutral-400">{item.href}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Assistant Button */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setAssistantOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
          >
            <Sparkle size={16} />
            Assistant
          </button>

          {assistantOpen ? (
            <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg">
              <p className="mb-2 text-sm font-semibold text-neutral-900">Actions rapides</p>
              <div className="space-y-1">
                <Link href="/locataires/new" className="flex items-center justify-between rounded-xl px-2 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
                  <span>Créer un locataire</span>
                  <Users size={14} className="text-primary-600" />
                </Link>
                <Link href="/contrats/new" className="flex items-center justify-between rounded-xl px-2 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
                  <span>Créer un contrat</span>
                  <FileText size={14} className="text-primary-600" />
                </Link>
                <Link href="/immeubles/new" className="flex items-center justify-between rounded-xl px-2 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
                  <span>Ajouter un immeuble</span>
                  <Buildings size={14} className="text-primary-600" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Action Button */}
        <Link
          href={quickAction.href}
          className="hidden items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 md:inline-flex"
        >
          <QuickIcon size={16} />
          {quickAction.label}
        </Link>
        
        {/* Alert Bell */}
        <AlertBell />
        
        {/* User Menu */}
        <UserMenu />
      </div>
    </nav>
  );
}
