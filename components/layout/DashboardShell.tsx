"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import NavigationDrawer from "@/components/layout/NavigationDrawer";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const handleHamburgerClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Desktop Sidebar - Fixed */}
      <Sidebar 
        open={sidebarOpen} 
        onToggleOpen={() => setSidebarOpen((o) => !o)} 
      />

      {/* Main Content - Adjusted for fixed sidebar */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-24"
      )}>
        <Navbar 
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
