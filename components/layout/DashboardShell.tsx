"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import NavigationDrawer from "@/components/layout/NavigationDrawer";
import { NAV_TITLES } from "@/components/layout/nav-items";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const title = Object.entries(NAV_TITLES).find(([href]) =>
    pathname?.startsWith(href)
  )?.[1];

  const handleHamburgerClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Desktop Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onToggleOpen={() => setSidebarOpen((o) => !o)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title={title} 
          onMenuClick={handleHamburgerClick}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 px-4 py-6 lg:px-8 pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <NavigationDrawer 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
}
